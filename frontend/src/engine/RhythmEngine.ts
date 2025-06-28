// src/engine/RhythmEngine.ts

import { GraphEngine } from './GraphEngine';
import { ECG_CONFIG, MAX_DELAY, BASE_SYSTOLIC_MS, DEFAULT_RR } from '../constants/constants';
import { Path } from './graphs/Path';
import { PulseWaveFn } from './generators/generatePulseWave';
import { BreathEngine } from './BreathEngine';
import { VENTRICULAR_NODES } from '../constants/constants';
import type { WaveBufferMap } from './WaveBuffer';
import { AudioController } from '../lib/AudioController';
import { WaveformController } from './generators/WaveformController';
import { ContractionDetector } from './ContractionDetector';

export class RhythmEngine {
  private graph: GraphEngine;
  private bufferRef: React.MutableRefObject<WaveBufferMap>;
  private lastStepTime = 0;
  private paths: Path[];
  private onHrUpdate?: (hr: number) => void;

  // PI管理
  private currentPI: number = 2.0;
  private pendingPI: number = 2.0;

  // Windkesselモデル用パラメータ
  private r: number = 0.06;
  private c: number = 1.2;
  private sv: number = 70;
  private pulseWaveFn: (t: number) => number = () => 0;
  private breathEngine: BreathEngine;

  // Controller
  private audioController: AudioController;
  private waveformController: WaveformController;
  private contractionDetector: ContractionDetector;

  // RR/HR状態
  private rr: number = DEFAULT_RR;

  private _getVitals?: () => {
    spo2: number;
    nibp_sys: number;
    nibp_dia: number;
    etco2?: number;
    pi?: number;
  };

  constructor({
    graph,
    bufferRef,
    audioCtx,
    isBeepOn,
    getVitals,
    rr,
    onHrUpdate,
    breathEngine,
  }: {
    graph: GraphEngine;
    bufferRef: React.MutableRefObject<WaveBufferMap>;
    audioCtx?: AudioContext | null;
    isBeepOn?: () => boolean;
    getVitals?: () => {
      spo2: number;
      nibp_sys: number;
      nibp_dia: number;
      etco2?: number;
      pi?: number;
    };
    rr?: number;
    onHrUpdate?: (hr: number) => void;
    breathEngine: BreathEngine;
  }) {
    this.graph = graph;
    this.bufferRef = bufferRef;
    this.rr = rr ?? DEFAULT_RR;
    this.paths = graph.getPaths();
    this.onHrUpdate = onHrUpdate;
    this.breathEngine = breathEngine;

    this.currentPI = 1.0;
    this.pendingPI = 1.0;
    this.updatePulseWaveFn(this.currentPI);

    this.audioController = new AudioController({
      audioCtx: audioCtx ?? null,
      isBeepOn,
    });
    this.waveformController = new WaveformController({
      bufferRef: this.bufferRef,
      breathEngine: this.breathEngine,
    });
    this.contractionDetector = new ContractionDetector(VENTRICULAR_NODES);

    this._getVitals = getVitals;
  }

  /** 外部からPI（脈波振幅）を設定（即時反映されず、次周期で反映） */
  public setPendingPI(pi: number) {
    this.pendingPI = pi;
  }

  /** rrから収縮期長sdを計算（Path補正式と一致） */
  private calcSd(rr: number): number {
    const rrFactor = Math.max(0.5, Math.min(1.5, Math.sqrt(rr / 1000)));
    return BASE_SYSTOLIC_MS * rrFactor;
  }

  /** PulseWaveFn再生成。PIは周期ごとにcurrentPIで決定 */
  public updatePulseWaveFn(pi: number) {
    const sd = this.calcSd(this.rr);
    this.pulseWaveFn = PulseWaveFn({
      rr: this.rr,
      r: this.r,
      c: this.c,
      sv: this.sv,
      sd: sd,
      pi: pi,
      dt: 1,
    });
  }

  /** 波形バッファの更新（WaveformController経由） */
  public updateBuffer(nowMs: number) {
    const pulseElapsed = nowMs - this.contractionDetector.getLastContractionTime();
    this.waveformController.updateBuffer(
      nowMs,
      this.paths,
      this.rr,
      this.pulseWaveFn,
      pulseElapsed
    );
  }

  public setGraph(graph: GraphEngine) {
    this.graph = graph;
    this.paths = graph.getPaths();
  }

  public step(currentTime: number, isRunning: boolean) {
    if (!isRunning) return [];

    while (currentTime - this.lastStepTime >= ECG_CONFIG.stepMs / 1000) {
      this.lastStepTime += ECG_CONFIG.stepMs / 1000;
      const t = this.lastStepTime;
      const nowMs = Math.round(t * 1000);

      this.updateBuffer(nowMs - MAX_DELAY);
      const vitals = this._getVitals?.();

      // 脈波振幅(PI)をUI/SimOptionsから反映（pendingPIにセットされていたら、次周期で切り替え）
      if (vitals?.pi !== undefined && this.pendingPI !== vitals.pi) {
        this.setPendingPI(vitals.pi);
      }

      const firing = this.graph.tick(t * 1000);

      // 拍動検知（周期開始）：ContractionDetector経由
      const contractionDetected = this.contractionDetector.update(firing, t * 1000);
      if (contractionDetected) {
        // HR, RR更新
        const hr = this.contractionDetector.getHR();
        this.onHrUpdate?.(hr);
        this.rr = this.contractionDetector.getRR();

        // ここでpendingPI→currentPIへ切り替え（周期反映の本体）
        if (this.pendingPI !== this.currentPI) {
          this.currentPI = this.pendingPI;
        }
        // 毎拍でPulseWaveFn再生成（PIやrrや他パラが反映される）
        this.updatePulseWaveFn(this.currentPI);

        const spo2ForBeep = vitals?.spo2 ?? -1;
        this.audioController.playBeep(spo2ForBeep);
      }
    }
  }

  public setOnHrUpdate(callback: (hr: number) => void) {
    this.onHrUpdate = callback;
  }

  public setAudioContext(ctx: AudioContext) {
    this.audioController.setAudioContext(ctx);
  }

  public isInContraction(): boolean {
    return this.contractionDetector.isInContraction();
  }
}
