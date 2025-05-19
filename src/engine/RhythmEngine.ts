import { SimOptions } from '../types/SimOptions';
import { GraphEngine } from './GraphEngine';
import { playBeep } from '../audio/playBeep';
import { ECG_CONFIG, MAX_DELAY } from '../constants/constants';
import { WaveBufferMap } from './WaveBuffer';
import { LeadName } from '../constants/leadVectors';
import { Path } from './graphs/Path';

const DEFAULT_RR = 750;
const MS_PER_MINUTE = 60000;

export class RhythmEngine {
  private simOptions: SimOptions;
  private graph: GraphEngine;
  private audioCtx?: AudioContext | null;
  private isBeepOnRef?: React.MutableRefObject<boolean>;
  private bufferRef: React.MutableRefObject<WaveBufferMap>;
  private lastStepTime = 0;
  private paths: Path[];
  private rr: number;
  private vFireTimes: number[] = [];

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
    this.rr = this.simOptions.rr || DEFAULT_RR;
    this.paths = graph.getPaths();
  }

  /** バッファの更新 */
  public updateBuffer(nowMs: number) {
    const voltages: Record<LeadName, number> = {} as Record<LeadName, number>;

    for (const path of this.paths) {
      const baseWave = path.getBaseWave(nowMs, this.rr);
      for (const lead in path.dotFactors) {
        const dotFactor = path.dotFactors[lead as LeadName];
        voltages[lead as LeadName] = (voltages[lead as LeadName] || 0) + baseWave * dotFactor;
      }
    }

    for (const lead in voltages) {
      this.pushBuffer(lead as LeadName, voltages[lead as LeadName]);
    }
  }

  /** HRとRRのセット */
  public setHr(newHr: number) {
    this.simOptions.hr = newHr;
    this.rr = newHr > 0 ? Math.round(MS_PER_MINUTE / newHr) : DEFAULT_RR;
    this.simOptions.rr = this.rr;
    this.onHrUpdate?.(newHr);
  }

  /** グラフの設定 */
  public setGraph(graph: GraphEngine) {
    console.log('🔁 [RhythmEngine] Graph updated!');
    this.graph = graph;
    this.paths = graph.getPaths();
  }

  /** 直近RRを計算 */
  private calculateLastRR(): number {
    if (this.vFireTimes.length < 2) return DEFAULT_RR;
    const [prev, last] = this.vFireTimes.slice(-2);
    const rr = last - prev;
    return rr > 0 ? rr : DEFAULT_RR;
  }

  /** 心拍数の中央値からHRを計算 */
  private calculateHrFromMedian(): number {
    if (this.vFireTimes.length < 2) return -1;
    const intervals = this.vFireTimes.slice(-6).map((t, i, arr) => (i > 0 ? t - arr[i - 1] : 0)).filter(v => v > 0);
    if (intervals.length === 0) return -1;
    intervals.sort((a, b) => a - b);
    const median = intervals[Math.floor(intervals.length / 2)];
    return Math.round(MS_PER_MINUTE / median);
  }

  /** step関数 */
  public step(currentTime: number, isRunning: boolean) {
    if (!isRunning) return [];

    while (currentTime - this.lastStepTime >= ECG_CONFIG.stepMs / 1000) {
      this.lastStepTime += ECG_CONFIG.stepMs / 1000;
      const t = this.lastStepTime;

      // バッファ更新
      this.updateBuffer(t * 1000 - MAX_DELAY);

//      if ( t > 6 && t < 6.01){console.log(this.bufferRef.current["II"]);}

      // Pulse波形計算
      const pulse = this.pulseWaveFn(t - this.graph.getLastConductedAt('His->V') / 1000);
      this.pushBuffer('pulse', pulse);
      this.pushBuffer('spo2', 0.3);

      // Ventricle firing check
      const firing = this.graph.tick(t * 1000);
      if (firing.includes('NH->His')) {
        const now = t * 1000;
        this.vFireTimes.push(now);
        this.vFireTimes = this.vFireTimes.filter(ts => ts >= now - 5000); // 5秒以内

        // HRとRRの更新
        const hr = this.calculateHrFromMedian();
        this.setHr(hr);
        this.rr = this.calculateLastRR();

        // Spo2コールバック
        const spo2 = this.simOptions.spo2 ?? -1;
        this.onSpo2Update?.(spo2);

        // Beep音
        if (this.audioCtx && this.isBeepOnRef?.current) {
          playBeep(this.audioCtx, spo2);
        }
      }
    }
  }

  private pulseWaveFn: (t: number) => number = () => 0;
  private onHrUpdate?: (hr: number) => void;
  private onSpo2Update?: (spo2: number) => void;

  public setOnHrUpdate(callback: (hr: number) => void) {
    this.onHrUpdate = callback;
  }

  public setOnSpo2Update(callback: (spo2: number) => void) {
    this.onSpo2Update = callback;
  }

  private pushBuffer(key: string, val: number) {
    this.bufferRef.current[key]?.push(val);
  }

  public setAudioContext(ctx: AudioContext) {
    this.audioCtx = ctx;
  }
}
