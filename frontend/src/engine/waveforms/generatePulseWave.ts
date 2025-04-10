// engine/waveforms/generatePulseWave.ts

export function generatePulseWave(hr: number, samplingRate: number): number[] {
    const beatSec = 60 / hr;
    const samples = Math.round(beatSec * samplingRate);
  
    const waveform: number[] = [];
  
    for (let i = 0; i < samples; i++) {
      const phase = i / samples;
  
      // 簡易パルス波（10%だけ盛り上がる）
      let value = 0;
      if (phase < 0.1) {
        value = Math.sin(phase * Math.PI * 10); // なだらかに立ち上がる
      }
  
      waveform.push(value);
    }
  
    return waveform;
  }
  