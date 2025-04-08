// RhythmEngine.ts
import { generatePWave, generateQRST } from './waveforms/generatePWave';
import { ECGBuffer } from './ECGBuffer';


export class RhythmEngine {
  private buffer: ECGBuffer;
  private hr: number;
  private stepMs: number;
  private timeMs: number;
  private currentWave: number[] = [];
  private waveIndex = 0;

  constructor({ buffer, hr = 80, stepMs = 5 }: {
    buffer: ECGBuffer;
    hr?: number;
    stepMs?: number;
  }) {
    this.buffer = buffer;
    this.hr = hr;
    this.stepMs = stepMs;
  }

  public setHr(newHr: number) {
    this.hr = newHr; // ← ここでちゃんと更新
  }
  
  private generateNewBeat() {
    const p = generatePWave({ hr: this.hr });
    const qrst = generateQRST({ hr: this.hr });
      
    const samplingRate = 200; // 1秒あたり200サンプル = dt 5ms

    const PQ_DELAY_MS = 110;

    const pqSamples = Math.round((PQ_DELAY_MS / 1000) * samplingRate); // → 22サンプル

    const pqGap = new Array(pqSamples).fill(0);

    this.currentWave = [...p, ...pqGap, ...qrst];
    this.waveIndex = 0;

  }
  

  step(deltaMs: number) {
    this.timeMs += deltaMs;
  
    const samplesPerStep = Math.round((this.stepMs / 1000) * 200); // dt=5ms（200Hz）前提
  
    for (let i = 0; i < samplesPerStep; i++) {
      if (this.waveIndex >= this.currentWave.length) {
        console.log('[RhythmEngine] wave ended, generating new beat');
        this.generateNewBeat();
      }
  
      const val = this.currentWave[this.waveIndex] || 0;
      this.buffer.push(val);

    this.waveIndex++;
    }
  }
  
}
