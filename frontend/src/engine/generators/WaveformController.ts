import type React from 'react';
import type { WaveBufferMap } from '../WaveBuffer';
import type { LeadName } from '../../constants/leadVectors';
import { STEP_MS } from '../../constants/constants';
import type { BreathEngine } from '../BreathEngine';

export class WaveformController {
  private bufferRef: React.MutableRefObject<WaveBufferMap>;
  private breathEngine: BreathEngine;

  constructor({
    bufferRef,
    breathEngine,
  }: {
    bufferRef: React.MutableRefObject<WaveBufferMap>;
    breathEngine: BreathEngine;
  }) {
    this.bufferRef = bufferRef;
    this.breathEngine = breathEngine;
  }

  /** バッファへ値をpush */
  public pushBuffer(key: string, val: number) {
    this.bufferRef.current[key]?.push(val);
  }

  /**
   * 波形バッファの更新
   * @param nowMs 現在時刻[ms]
   * @param paths 合成対象Path[]
   * @param rr RR間隔[ms]
   * @param pulseWaveFn SPO2脈波生成関数
   * @param pulseElapsed SPO2周期経過ms
   * @param lastContractionTime 収縮基準時刻
   */
  public updateBuffer(
    nowMs: number,
    paths: any[],
    rr: number,
    pulseWaveFn: (t: number) => number,
    pulseElapsed: number
  ) {
    const voltages: Record<LeadName, number> = {} as Record<LeadName, number>;

    // ECGリード合成
    for (const path of paths) {
      const baseWave = path.getBaseWave(nowMs, rr);
      for (const lead in path.dotFactors) {
        const dotFactor = path.dotFactors[lead as LeadName];
        voltages[lead as LeadName] = (voltages[lead as LeadName] || 0) + baseWave * dotFactor;
      }
    }

    for (const lead in voltages) {
      const v = voltages[lead as LeadName];
      this.pushBuffer(lead as LeadName, v);
    }

    // SPO2脈波
    const spo2 = pulseWaveFn(pulseElapsed >= 0 ? pulseElapsed : 0);
    this.pushBuffer('spo2', spo2);

    // ETCO2
    if (nowMs % (3 * STEP_MS) === 0) {
      const etco2 = this.breathEngine.getEtco2(nowMs);
      this.pushBuffer('etco2', etco2);
    }
  }
}
