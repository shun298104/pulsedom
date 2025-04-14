// engine/waveforms/generatePulseWave.ts

import { ECG_CONFIG } from '../../constants';
import { SimOptions } from '../../types/SimOptions';

export function generatePulseWave(simOptions: SimOptions): number[] {
  const { hr, waveform } = simOptions;
  const samplingRate = ECG_CONFIG.samplingRate;
  const beatMs = 60000 / hr;
  const totalSamples = Math.round((beatMs / 1000) * samplingRate);

  const peakRatio = 0.25;
  const systolicEndRatio = 0.45;

  const peakPoint = Math.round(totalSamples * peakRatio);
  const systolicEnd = Math.round(totalSamples * systolicEndRatio);
  const decaySamples = totalSamples - systolicEnd;
  const tau = decaySamples / 4;

  const a = 1 / (peakPoint ** 2);
  const systolicEndValue = -a * (systolicEnd - peakPoint) ** 2 + 1;

  const mgnfy = waveform?.mgnfy ?? 1;
  const baseline = waveform?.baseline ?? 0;

  const waveformArray: number[] = [];

  for (let i = 0; i < totalSamples; i++) {
    let value = 0;

    if (i <= systolicEnd) {
      value = -a * (i - peakPoint) ** 2 + 1;
    } else {
      const x = i - systolicEnd;
      value = systolicEndValue * Math.exp(-x / tau);
    }

    waveformArray.push(Math.max(0, value * mgnfy + baseline));
  }

  return waveformArray;
}
