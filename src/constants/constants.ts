// src/constants.ts

// リアルタイム波形評価のステップ間隔（ms単位）
export const STEP_MS = 5;

 // 収縮期の基本時間（ms単位）
export const BASE_SYSTOLIC_MS = 300;

// デフォルトのRR間隔（ms単位）
export const DEFAULT_RR = 750;

//　＝canvasで描画しない時間(ms)
export const MAX_DELAY = 120;

// 1秒あたりのピクセル数（Canvas描画用）
export const SCALE = {
  mmPerSec: 25,     // 横：25mm/s
  mmPerMv: 10,      // 縦：1mV = 10mm
  pxPerMm: 8,       // 1mmあたり4px（=10mm→40px）
};

// Canvas描画用の基本定数群
export const PX_SCALE = {
  pxPerSec: SCALE.mmPerSec * SCALE.pxPerMm,   // 25mm/s * 4px/mm = 100px/s
  pxPerMv: SCALE.mmPerMv * SCALE.pxPerMm,     // 10mm/mV * 4px/mm = 40px/mV
};

// ECGシミュレーション用の基本定数群
export const ECG_CONFIG = {
  samplingRate: 1000, // not used yet, but useful if we synthesize wave buffers later
  stepMs: STEP_MS,
};

//　心室ノード
export const VENTRICULAR_NODES: Set<string> = new Set([
  'LV1BA', 'LV2BAS', 'LV3BS', 'LV4BI', 'LV5BP', 'LV6BL',
  'LV7MA', 'LV8MAS', 'LV9MS', 'LV10MI', 'LV11MP', 'LV12ML',
  'LV13AA', 'LV14AAS', 'LV15AI', 'LV16AP', 'LV17A',
  'RVB1A', 'RVB2S', 'RVM3A', 'RVM4S', 'RVA5A', 'RVA6S',
]);