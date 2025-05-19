//src/rules/graphControlRuleList.ts
import type { GraphControlRule } from './GraphControlTypes';
import { Af } from './generators/AfCustomRule';

export const graphControlRules: GraphControlRule[] = [
  {
    id: 'NSR',
    label: 'normal sinus rhythm',
    group: 'AtrialStatus',
    exclusiveGroup: 'AtrialArrhythmia',
    description: 'Default atrial conduction. Enables SA node and IA conduction.',
    effects: {
      node: {
        SA: { autofire: true },
      },
      path: {
        'A->IA': { block: false, },
        'IA->A': { block: false, },
        'LA->PV1': { block: true, },
        'PV1->PV2': { block: true, },
        'PV2->LA': { block: true, },
        'LA->IA': { block: true, },
        'IA->CTI2': { block: true, },
        'CTI2->IA': { block: true, },
        'IA->AN_fast': { probability: 1.0 },
        'IA->AN_slow': { probability: 1.0 }
      }
    }
  },
  Af,
  {
    id: 'AFL',
    label: 'Atrial Flutter',
    group: 'demo',
    //    group: 'AtrialStatus',
    exclusiveGroup: 'AtrialArrhythmia',
    description: 'Enables the IA↔CTI2 reentrant loop and LA→IA conduction.',
    effects: {
      node: {
        CTI2: { autofire: true, },
        LA: { refractory: 150, },
      },

      path: {
        'IA->CTI2': { block: false, },
        'CTI2->IA': { block: false, },
        'LA->PV1': { block: true, },
        'PV1->PV2': { block: true, },
        'PV2->LA': { block: true, },
      },
    },
  },
  {
    id: 'stop',
    label: 'Sinus Arrest',
    group: 'AtrialStatus',
    description: 'Disables automatic firing of the SA node.',
    effects: {
      node: {
        SA: { autofire: false, },
        LA: { refractory: 150, },
      },
    },
  },
  {
    id: 'AVNRT',
    label: 'AVNRT',
    group: 'demo',
    //    group: 'JunctionStatus',
    exclusiveGroup: 'AVstatus',
    description: 'AV node Reentry Tachycardia',
    effects: {
      node: {
        AN: { forceFiring: true },
        LA: { refractory: 150, },
      },
      path: {
        'IA->AN_fast': { refractoryMs: 100, },
        'IA->AN_slow': { refractoryMs: 40 },
        'IA->AN_fast_retro': { refractoryMs: 40 },
        'IA->AN_slow_retro': { refractoryMs: 100 },
      }
    }
  },
  {
    id: 'RESET',
    label: 'rest all nodes and paths',
    group: 'demo',
    //    group: 'JunctionStatus',
    exclusiveGroup: 'none',
    description: 'AV node Reentry Tachycardia',
    effects: {
      node: {
        SA: { autofire: true },
        CTI2: { autofire: true }
      },
      path: {
        'IA->AN_fast': { refractoryMs: 250, probability: 1.0 },
        'IA->AN_slow': { refractoryMs: 250, probability: 1.0 },
        'IA->AN_fast_retro': { refractoryMs: 300 },
        'IA->AN_slow_retro': { refractoryMs: 300 },
        'A->IA': { block: false, },
        'IA->A': { block: false, },
        'LA->PV1': { block: true, },
        'PV1->PV2': { block: true, },
        'PV2->LA': { block: true, },
        'LA->IA': { block: true, },
        'IA->CTI2': { block: true, },
        'CTI2->IA': { block: true, },
      }
    }
  },
];
