// src/rules/generators/AflCustomRule.ts
import { GraphControlRule } from '../GraphControlTypes';

/**
 * AFLカスタムルール（bpm/伝導比カスタム）
 * @param f AFL周波数 (bpm, 例: 300)
 * @param ratio 伝導比 (整数, 例: 2 → 2:1)
 * @returns GraphControlRule
 */
export function AflCustomRule(f: number, ratio: number): GraphControlRule {
  // 1周を3パスで分割、bpm→delayMs換算（1分=60000ms）
  const delayMs = Math.floor(60000 / f / 3);
  const conductionProb = 1 / ratio;

  return {
    id: `AFL_custom_${f}_${ratio}`,
    label: `AFL ${f} bpm, ${ratio}:1 conduction`,
    group: 'AtrialStatus',
    exclusiveGroup: 'AtrialArrhythmia',
    description: `AFL with ${f} bpm, ${ratio}:1 AV conduction`,
    effects: {
      setOptions: { aflWaveFreq: f, aflConductRatio: ratio },
      path: {
        'LA->PV1': { delayMs, block: false },
        'PV1->PV2': { delayMs, block: false },
        'PV2->LA': { delayMs, block: false },
        'IA->AN_fast': { probability: conductionProb },
        'IA->AN_slow': { probability: conductionProb },
      },
      node: {
        SA: { autofire: false },
        LA: { forceFiring: true }
      }
    },
    uiControls: [
      {
        type: 'slider',
        key: 'aflWaveFreq',
        label: 'AFL wave frequency',
        min: 200,
        max: 400,
        step: 10,
        defaultValue: f
      },
      {
        type: 'slider',
        key: 'aflConductRatio',
        label: 'AFL conduction ratio',
        min: 1,
        max: 5,
        step: 1,
        defaultValue: ratio
      }
    ]
  };
}
