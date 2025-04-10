// src/engine/RhythmEngine.ts

import { WaveBuffer } from './WaveBuffer';
import { generatePWave, generateQRST } from './waveforms/generatePWave';
import { ECG_CONFIG } from '../constants';

export class RhythmEngine {
  private buffers: Record<string, WaveBuffer>;
  private hr: number;
  private timeMs: number = 0;
  private nextBeatMs: number = 0;
  private currentWave: number[] = [];
  private waveIndex = 0;
  private spo2Queue: number[][] = [];

  constructor({ buffers, hr = 80 }: { buffers: Record<string, WaveBuffer>; hr?: number }) {
    this.buffers = buffers;
    this.hr = hr;

    this.generateNewBeat();
    this.nextBeatMs = this.timeMs + 60000 / this.hr;
  }

  public setHr(newHr: number) {
    this.hr = newHr;
  }

  public resetNextBeat() {
    this.nextBeatMs = this.timeMs + 60000 / this.hr;
  }

  private generateNewBeat() {
    const p = generatePWave({ hr: this.hr });
    const qrst = generateQRST({ hr: this.hr });

    const PQ_DELAY_MS = 110;
    const { samplingRate } = ECG_CONFIG;
    const pqSamples = Math.max(0, Math.round((PQ_DELAY_MS / 1000) * samplingRate) - p.length);
    const pqGap = new Array(pqSamples).fill(0);

    // ❤️ 余韻を残すためのrest区間（100ms）
    const restSamples = Math.round((100 / 1000) * samplingRate);
    const rest = new Array(restSamples).fill(0);

    this.currentWave = [...p, ...pqGap, ...qrst, ...rest];
    this.waveIndex = 0;
    console.log('✅ p-QRST+rest was generated!', this.currentWave);
  }

  public step(deltaMs: number) {
    const { samplingRate } = ECG_CONFIG;
    const samplesPerStep = Math.max(1, Math.floor((samplingRate * deltaMs) / 1000));

    for (let i = 0; i < samplesPerStep; i++) {
      this.timeMs += 1000 / samplingRate;

      const ecgVal =
        this.waveIndex < this.currentWave.length ? this.currentWave[this.waveIndex++] ?? 0 : 0;
      this.buffers['ecg']?.push(ecgVal);

      const spo2 = this.buffers['spo2'];
      if (spo2) {
        const wave = this.spo2Queue[0];
        if (wave) {
          const val = wave.shift() ?? 0;
          spo2.push(val);
          if (wave.length === 0) this.spo2Queue.shift();
        } else {
          spo2.push(0);
        }
      }

      if (this.waveIndex >= this.currentWave.length && this.timeMs >= this.nextBeatMs) {
        this.generateNewBeat();
        this.nextBeatMs = this.timeMs + 60000 / this.hr;
        console.log('💓 Next beat at:', this.timeMs, 'ms');
      }
    }
  }
}