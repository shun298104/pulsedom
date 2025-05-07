// src/engine/RhythmEngine.ts

import { SimOptions } from '../types/SimOptions';
import { GraphEngine } from './GraphEngine';
import { playBeep } from '../audio/playBeep';
import { ECG_CONFIG } from '../constants/constants';
import { WaveBufferMap } from './WaveBuffer';
import { leadVectors, LeadName } from '../constants/leadVectors';

export class RhythmEngine {
  private simOptions: SimOptions;
  private graph: GraphEngine;
  audioCtx?: AudioContext | null | undefined;
  private isBeepOnRef?: React.MutableRefObject<boolean>;
  private bufferRef: React.MutableRefObject<WaveBufferMap>;
  private lastStepTime = 0;

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
  }

  public updateSimOptions(next: SimOptions) {
    this.simOptions = next;
  }

  public setHr(newHr: number) {
    this.simOptions.hr = newHr;
    this.onHrUpdate?.(newHr);
  }

  public setGraph(graph: GraphEngine) {
    console.log('🔁 [RhythmEngine] Graph updated!');
    this.graph = graph;
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
      const t = this.lastStepTime;// tは秒単位!!!
      const firing = this.graph.tick(t * 1000);

      Object.keys(leadVectors).forEach(
        (lead) => this.pushBuffer(lead, this.graph.sumPathVoltages(t * 1000, lead as LeadName))
      );
      
      const pulse = this.pulseWaveFn(t - this.graph.getLastConductedAt('His->V') / 1000);
      this.pushBuffer('pulse', pulse);
      this.pushBuffer('spo2', 0.3);

      if (firing.includes('LBB->LV_main')) {
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
