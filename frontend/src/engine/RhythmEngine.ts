// src/engine/RhythmEngine.ts
import { GraphEngine } from './GraphEngine';
import { playBeep } from '../audio/playBeep';
import { ECG_CONFIG, MAX_DELAY } from '../constants/constants';
import { Path } from './graphs/Path';
import type { WaveBufferMap } from './WaveBuffer';
import type { LeadName } from '../constants/leadVectors';
import { PulseWaveFn } from './generators/generatePulseWave';

import { VENTRICULAR_NODES } from '../constants/constants';

const DEFAULT_RR = 750;
const MS_PER_MINUTE = 60000;
const BASE_SYSTOLIC_MS = 300; // 生理値基準

export class RhythmEngine {
  private graph: GraphEngine;
  private audioCtx?: AudioContext | null;
  private isBeepOn?: () => boolean;
  private _getVitals?: () => {
    spo2: number;
    nibp_sys: number;
    nibp_dia: number;
  };
  private bufferRef: React.MutableRefObject<WaveBufferMap>;
  private lastStepTime = 0;
  private paths: Path[];
  private vFireTimes: number[] = [];
  private onHrUpdate?: (hr: number) => void;
  private lastContractionTime: number;
  private ventricularFiringSet: Set<string> = new Set();
  private isContracting: boolean = false;
  private rr: number = DEFAULT_RR;

  // Windkesselモデル用パラメータ（SimOptions/UI等と連動可能）
  private r: number = 0.06;
  private c: number = 1.2;
  private sv: number = 70;
  private pulseWaveFn: (t: number) => number = () => 0;

  constructor({
    graph,
    bufferRef,
    audioCtx,
    isBeepOn,
    getVitals,
    rr,
    onHrUpdate,
  }: {
    graph: GraphEngine;
    bufferRef: React.MutableRefObject<WaveBufferMap>;
    audioCtx?: AudioContext | null;
    isBeepOn?: () => boolean;
    getVitals?: () => {
      spo2: number;
      nibp_sys: number;
      nibp_dia: number;
    };
    rr?: number;
    onHrUpdate?: (hr: number) => void;
  }) {
    this.graph = graph;
    this.audioCtx = audioCtx ?? null;
    this.isBeepOn = isBeepOn;
    this._getVitals = getVitals;
    this.rr = rr ?? DEFAULT_RR;
    this.bufferRef = bufferRef;
    this.paths = graph.getPaths();
    this.onHrUpdate = onHrUpdate;
    this.lastContractionTime = -3_000;

    // 初期pulseWaveFn（sdはrr依存で都度計算するのでここは適当でOK）
    this.updatePulseWaveFn();
  }

  /** rrから生理学的収縮期長sdを計算（Path補正式と完全一致） */
  private calcSd(rr: number): number {
    const rrFactor = Math.max(0.5, Math.min(1.5, Math.sqrt(rr / 1000)));
    return BASE_SYSTOLIC_MS * rrFactor;
  }

  /** Windkessel厳密モデルでpulseWaveFnを再生成（毎拍呼ぶ） */
  public updatePulseWaveFn() {
    const sd = this.calcSd(this.rr);
    this.pulseWaveFn = PulseWaveFn({
      rr: this.rr,
      r: this.r,
      c: this.c,
      sv: this.sv,
      sd: sd, // PathのQT補正式と同じ計算で注入！
      dt: 1,
    });
  }

  private checkContractionByNodeFiring(firedNow: string[]): boolean {
    for (const nodeId of firedNow) {
      if (VENTRICULAR_NODES.has(nodeId)) {
        this.ventricularFiringSet.add(nodeId);
      }
    }
    if (this.ventricularFiringSet.size >= VENTRICULAR_NODES.size) {
      this.ventricularFiringSet.clear();
      this.isContracting = true;
      return true;
    }
    return false;
  }

  public isInContraction(): boolean {
    return this.isContracting;
  }

  public updateBuffer(nowMs: number) {
    const voltages: Record<LeadName, number> = {} as Record<LeadName, number>;
    const rr = this.rr ?? DEFAULT_RR;

    // 1. 各Pathから理論値合成
    for (const path of this.paths) {
      const baseWave = path.getBaseWave(nowMs, rr);
      for (const lead in path.dotFactors) {
        const dotFactor = path.dotFactors[lead as LeadName];
        voltages[lead as LeadName] = (voltages[lead as LeadName] || 0) + baseWave * dotFactor;
      }
    }

    // 2. ノイズ＆呼吸性ゆらぎを注入
    const tSec = nowMs / 1000;
    const NOISE_STDDEV = 0.01; // ノイズ強度（標準偏差、適宜調整）
    const RESP_RATE = 0.25;    // 呼吸周期 [Hz]（例: 0.25Hz=15回/分）
    const RESP_AMP = 0.07;     // 呼吸変動振幅（3% of 波形、適宜調整）

    for (const lead in voltages) {
      // ホワイトノイズ（±NOISE_STDDEVの一様分布: 簡易版）
      const noise = NOISE_STDDEV * (Math.random() * 2 - 1);
      // 呼吸性ゆらぎ（正弦波modulation）
      const respMod = 1.0 + RESP_AMP * Math.sin(2 * Math.PI * RESP_RATE * tSec);
      // 合成
      const v = voltages[lead as LeadName] * respMod + noise;
      this.pushBuffer(lead as LeadName, v);
    }
  }


  public setGraph(graph: GraphEngine) {
    this.graph = graph;
    this.paths = graph.getPaths();
  }

  private calculateLastRR(): number {
    if (this.vFireTimes.length < 2) return DEFAULT_RR;
    const [prev, last] = this.vFireTimes.slice(-2);
    const rr = last - prev;
    return rr > 0 ? rr : DEFAULT_RR;
  }

  private calculateHrFromMedian(): number {
    if (this.vFireTimes.length < 2) return -1;
    const intervals = this.vFireTimes.slice(-6).map((t, i, arr) => (i > 0 ? t - arr[i - 1] : 0)).filter(v => v > 0);
    if (intervals.length === 0) return -1;
    intervals.sort((a, b) => a - b);
    const median = intervals[Math.floor(intervals.length / 2)];
    return Math.round(MS_PER_MINUTE / median);
  }

  public step(currentTime: number, isRunning: boolean) {
    if (!isRunning) return [];

    while (currentTime - this.lastStepTime >= ECG_CONFIG.stepMs / 1000) {
      this.lastStepTime += ECG_CONFIG.stepMs / 1000;
      const t = this.lastStepTime;
      const nowMs = t * 1000;

      this.updateBuffer(nowMs - MAX_DELAY);

      const vitals = this._getVitals?.();

      // 脈波ディレイ（例：120ms）でspo2波形をQRSより遅らせる
      const pulseElapsed = nowMs - this.lastContractionTime; // [ms]
      const spo2 = this.pulseWaveFn(pulseElapsed >= 0 ? pulseElapsed : 0);

      this.pushBuffer('spo2', spo2);

      const firing = this.graph.tick(t * 1000);
      if (this.checkContractionByNodeFiring(firing)) {
        const now = t * 1000;
        this.lastContractionTime = now;
        this.vFireTimes.push(now);
        this.vFireTimes = this.vFireTimes.filter(ts => ts >= now - 5000);

        const hr = this.calculateHrFromMedian();
        this.onHrUpdate?.(hr);
        this.rr = this.calculateLastRR();

        // 毎拍でPulseWaveFn再生成（rrやパラメータ変化対応・sdをrrから再計算）
        this.updatePulseWaveFn();

        const spo2ForBeep = vitals?.spo2 ?? -1;

        if (this.audioCtx && this.isBeepOn?.()) {
          playBeep(this.audioCtx, spo2ForBeep);
        }
      }
    }
  }

  public setOnHrUpdate(callback: (hr: number) => void) {
    this.onHrUpdate = callback;
  }

  private pushBuffer(key: string, val: number) {
    this.bufferRef.current[key]?.push(val);
  }

  public setAudioContext(ctx: AudioContext) {
    this.audioCtx = ctx;
  }
}
