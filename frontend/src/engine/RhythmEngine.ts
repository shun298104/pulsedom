import { WaveBuffer } from './WaveBuffer';
import { generatePWave, generateQRST } from './waveforms/generateWaveforms';
import { generatePulseWave } from './waveforms/generatePulseWave';
import { ECG_CONFIG } from '../constants';
import { SimOptions } from '../types/SimOptions';

export class RhythmEngine {
  private buffers: Record<string, WaveBuffer>;
  private simOptions: SimOptions;
  private timeMs: number = 0;
  private nextBeatMs: number = 0;
  private currentWave: number[] = [];
  private waveIndex = 0;
  private spo2Queue: number[][] = [];

  constructor({ buffers, simOptions }: { buffers: Record<string, WaveBuffer>; simOptions: SimOptions }) {
    this.buffers = buffers;
    this.simOptions = simOptions;

    this.generateNewBeat();
    this.nextBeatMs = 60000 / this.simOptions.hr;
  }

  public setHr(newHr: number) {
    this.simOptions.hr = newHr;
    this.nextBeatMs = this.timeMs + 60000 / this.simOptions.hr;
  }

  private generateNewBeat() {
    const { hr } = this.simOptions;
    const p = generatePWave(this.simOptions);
    const qrst = generateQRST(this.simOptions);

    const PQ_DELAY_MS = 100;
    const { samplingRate } = ECG_CONFIG;
    const pqSamples = Math.max(0, Math.round((PQ_DELAY_MS / 1000) * samplingRate) - p.length);
    const pqGap = new Array(pqSamples).fill(0);

    this.currentWave = [...p, ...pqGap, ...qrst];
    this.waveIndex = 0;

    const pulseWave = generatePulseWave(this.simOptions);
    this.spo2Queue.push(pulseWave);
  }

  public step(deltaMs: number) {
    const { samplingRate } = ECG_CONFIG;
    const samplesPerStep = Math.max(1, Math.floor((samplingRate * deltaMs) / 1000));

    for (let i = 0; i < samplesPerStep; i++) {
      this.timeMs += 1000 / samplingRate;

      const ecgVal = this.waveIndex < this.currentWave.length
        ? this.currentWave[this.waveIndex++] ?? 0
        : 0;
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

      if (this.timeMs >= this.nextBeatMs) {
        this.generateNewBeat();
        this.nextBeatMs = this.timeMs + 60000 / this.simOptions.hr;
      }
    }
  }
}
