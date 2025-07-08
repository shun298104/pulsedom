// src/constants/waveMetaMap.ts

export interface WaveMeta {
  label: string;
  unit: string;
  color: string;
  gain?: number; // px per unit
  baselineRatio?: number; // relative height (0.0 - 1.0)
  max?: number;
  min?: number;
  scaleLines?: number[];  // 追加
}

export const waveMetaMap: Record<string, WaveMeta> = {

  spo2: {
    label: 'SpO₂',
    unit: '%',
    color: '#22d3ee',
    gain: 1.5,
    baselineRatio: 0.7,
  },
  pulse: {
    label: 'Pulse Wave',
    unit: '',
    color: 'magenta',
    gain: 1,
    baselineRatio: 0.6,
  },
  etco2: {
    label: 'Capno',
    unit: 'mmHg',
    color: '#fde047',
    gain: 1,
    baselineRatio: 0.95,
    max: 60,             // ← 最大値60固定
    min: 0,              // ← 最小値0
    scaleLines: [0, 40], // ← 基準線（将来増やすときも柔軟）
  },
  art: {
    label: 'ART',
    unit: 'mmHg',
    color: 'red',
    gain: 2,
    baselineRatio: 0.5,
    max: 200,
    min: 0,
    scaleLines: [0, 80, 120], // 例：収縮・拡張圧/0
  },
};
