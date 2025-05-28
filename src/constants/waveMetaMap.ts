// src/constants/waveMetaMap.ts

export interface WaveMeta {
    label: string;
    unit: string;
    color: string;
    gain?: number; // px per unit
    baselineRatio?: number; // relative height (0.0 - 1.0)
  }
  
  export const waveMetaMap: Record<string, WaveMeta> = {

    spo2: {
      label: 'SpO₂',
      unit: '%',
      color: '#22d3ee',
      gain: 1.5,
      baselineRatio: 0.5,
    },
    art: {
      label: 'ART',
      unit: 'mmHg',
      color: 'orange',
      gain: 2,
      baselineRatio: 0.5,
    },
    pulse: {
      label: 'Pulse Wave',
      unit: '',
      color: 'magenta',
      gain: 1,
      baselineRatio: 0.6,
    },
  };
  