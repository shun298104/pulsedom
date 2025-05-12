// src/engine/RhythmEngine.ts

import { SimOptions } from '../types/SimOptions';
import { GraphEngine } from './GraphEngine';
import { playBeep } from '../audio/playBeep';
import { ECG_CONFIG } from '../constants/constants';
import { WaveBufferMap } from './WaveBuffer';
import { LeadName } from '../constants/leadVectors';
import { Path } from './graphs/Path';

export class RhythmEngine {
  private simOptions: SimOptions;
  private graph: GraphEngine;
  private audioCtx?: AudioContext | null;
  private isBeepOnRef?: React.MutableRefObject<boolean>;
  private bufferRef: React.MutableRefObject<WaveBufferMap>;
  private lastStepTime = 0;
  private paths: Path[];

  constructor({
    simOptions,
    graph,
    audioCtx,
    isBeepOnRef,
    bufferRef,
  }: {
    simOptions: SimOptions;
    graph: GraphEngine;
    audioCtx?: AudioContext | null;
    isBeepOnRef?: React.MutableRefObject<boolean>;
    bufferRef: React.MutableRefObject<WaveBufferMap>;
  }) {
    this.simOptions = simOptions;
    this.graph = graph;
    this.audioCtx = audioCtx ?? null;
    this.isBeepOnRef = isBeepOnRef;
    this.bufferRef = bufferRef;

    // GraphEngineからパスを取得
    this.paths = graph.getPaths();
  }

  /** バッファの更新 */
public updateBuffer(nowMs: number) {
  const voltages: Record<LeadName, number> = {} as Record<LeadName, number>;

  // 各Pathからベース波形を取得し、リードごとに集計
  for (const path of this.paths) {
      const baseWave = path.getBaseWave(nowMs);  // ベース波形を取得
      for (const lead in path.dotFactors) {
          const dotFactor = path.dotFactors[lead as LeadName];
          const voltage = baseWave * dotFactor;
          voltages[lead as LeadName] = (voltages[lead as LeadName] || 0) + voltage;
      }
  }

  // バッファにプッシュ
  for (const lead in voltages) {
      this.pushBuffer(lead as LeadName, voltages[lead as LeadName]);
  }
}


  /** シミュレーションオプションの更新 */
  public updateSimOptions(next: SimOptions) {
    this.simOptions = next;
  }

  /** HRの設定 */
  public setHr(newHr: number) {
    this.simOptions.hr = newHr;
    this.onHrUpdate?.(newHr);
  }

  /** グラフの設定 */
  public setGraph(graph: GraphEngine) {
    console.log('🔁 [RhythmEngine] Graph updated!');
    this.graph = graph;
    this.paths = graph.getPaths(); // パスも更新
  }

  private vFireTimes: number[] = [];
  private onHrUpdate?: (hr: number) => void;
  public setOnHrUpdate(callback: (hr: number) => void) {
    this.onHrUpdate = callback;
  }

  private onSpo2Update?: (spo2: number) => void;
  public setOnSpo2Update(callback: (spo2: number) => void) {
    this.onSpo2Update = callback;
  }

  private calculateHrFromMedian(times: number[]): number {
    if (times.length < 2) return -1;
    const recent = times.slice(-6);
    const intervals = [];
    for (let i = 1; i < recent.length; i++) {
      intervals.push(recent[i] - recent[i - 1]);
    }
    if (intervals.length === 0) return -1;
    const sorted = intervals.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    return Math.round(60000 / median);
  }

  private calculateLastRR(times: number[]): number {
    if (times.length < 2) return 1000;
    const last = times[times.length - 1];
    const prev = times[times.length - 2];
    return last - prev;
  }

  private pulseWaveFn: (t: number) => number = () => 0;

  public step(currentTime: number) {
    while (currentTime - this.lastStepTime >= ECG_CONFIG.stepMs / 1000) {
      this.lastStepTime += ECG_CONFIG.stepMs / 1000;
      const t = this.lastStepTime; // tは秒単位!!!

      // バッファ更新
      this.updateBuffer(t * 1000);

      // Pulse波形計算
      const pulse = this.pulseWaveFn(t - this.graph.getLastConductedAt('His->V') / 1000);
      this.pushBuffer('pulse', pulse);
      this.pushBuffer('spo2', 0.3);

      // Ventricle firing check (戻した部分)
      const firing = this.graph.tick(t * 1000);
      if (firing.includes('NH->His')) {
        const now = t * 1000;
        this.vFireTimes.push(now);
        const threshold = now - 5000;
        this.vFireTimes = this.vFireTimes.filter(ts => ts >= threshold);

        const spo2 = this.simOptions.spo2 ?? -1;
        this.onSpo2Update?.(spo2);

        const hr = this.calculateHrFromMedian(this.vFireTimes);
        this.setHr(hr);

        const rr = this.calculateLastRR(this.vFireTimes);
        this.simOptions.rr = rr;

        if (this.audioCtx && this.isBeepOnRef?.current) {
          playBeep(this.audioCtx, spo2);
        }
      }
    }
  }


  private pushBuffer(key: string, val: number) {
    this.bufferRef.current[key]?.push(val);
  }

  public setAudioContext(ctx: AudioContext) {
    this.audioCtx = ctx;
  }
}
