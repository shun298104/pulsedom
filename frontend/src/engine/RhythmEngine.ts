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

  constructor({
    buffer,
    hr = 80,
    stepMs = 10,
  }: {
    buffer: ECGBuffer;
    hr?: number;
    stepMs?: number;
  }) {
    this.buffer = buffer;
    this.hr = hr;
    this.stepMs = stepMs;
    this.timeMs = 0;

    this.generateNewBeat(); // 初期波形1拍分生成
    
  }

  private generateNewBeat() {
    const p = generatePWave({ hr: this.hr });
    const qrst = generateQRST({ hr: this.hr });
  
    console.log(`[DEBUG] p.length = ${p.length}, qrst.length = ${qrst.length}`);
  
    const samplingRate = 100; // 1秒あたり200サンプル = dt 5ms

    const PQ_DELAY_MS = 110;
    const pWaveDurationMs = (p.length / samplingRate) * 1000; // ← ここでP波長さ（ms）を取得

    const pqSamples = Math.round((PQ_DELAY_MS / 1000) * samplingRate); // → 22サンプル

    const pqGap = new Array(pqSamples).fill(0);

    this.currentWave = [...p, ...pqGap, ...qrst];
    this.waveIndex = 0;
  
    console.log('[RhythmEngine] Generated new beat: length =', this.currentWave.length);
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
      console.log(`[RhythmEngine] pushing wave[${this.waveIndex}] = ${val}`);
      this.buffer.push(val);
      this.waveIndex++;
    }
  }
  
}
