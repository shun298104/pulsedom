// src/rules/generators/AflCustomRule.ts
import { GraphControlRule } from '../GraphControlTypes';

/**
 * AFLカスタムルール（bpm/伝導比カスタム）
 * @param f AFL周波数 (bpm, 例: 300)
 * @param ratio 伝導比 (整数, 例: 2 → 2:1)
 * @returns GraphControlRule
 */
export const normalConduction: GraphControlRule = {
  id: 'normal_conduction',
  label: 'Normal Conduction',
  group: 'conduction_status',
  exclusiveGroup: 'conduction_status',
  description: 'reset AV conduction.',
  effects: {
    path: {
      'N->NH': { block: false },
    },
  },
}
export const CAVB: GraphControlRule = {
  id: 'CAVB',
  label: 'Complete AV Block',
  group: 'conduction_status',
  exclusiveGroup: 'conduction_status',
  description: 'Blocks N->NH.',
  effects: {
    path: {
      'N->NH': { block: true },
    },
  },
}

