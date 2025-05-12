//src/rules/graphControlRuleList.ts
import type { GraphControlRule } from './GraphControlTypes';

export const graphControlRules: GraphControlRule[] = [
  {
    id: 'NSR',
    label: 'normal sinus rhythm',
    group: 'AtrialStatus',
    //    exclusiveGroup: 'AtrialStatus',
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
  {
    id: 'Af',
    label: 'Atrial Fibrillation',
    group: 'AtrialStatus',
    //    exclusiveGroup: 'AtrialStatus',
    description: 'Blocks A→IA and applies probabilistic conduction from IA to AN. SA node suppressed.',
    effects: {
      node: {
        SA: { autofire: false, },
        LA: { forceFiring: true },
      },
      path: {
        'A->IA': { block: true, },
        'IA->A': { block: true, },
        'LA->IA': { block: false, },
        'LA->PV1': { block: false, },
        'PV1->PV2': { block: false, },
        'PV2->LA': { block: false, },
        'IA->AN_fast': { probability: 0.3, },
        'IA->AN_slow': { probability: 0.3, },
      },
    },
  },
  {
    id: 'AFL',
    label: 'Atrial Flutter',
    group: 'demo',
//    group: 'AtrialStatus',
    //    exclusiveGroup: 'AtrialStatus',
    description: 'Enables the IA↔CTI2 reentrant loop and LA→IA conduction.',
    effects: {
      node: {
        CTI2: { autofire: true, },
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
      },
    },
  },
  {
    id: 'AVNRT',
    label: 'AVNRT',
    group: 'demo',
//    group: 'JunctionStatus',
    //    exclusiveGroup: 'AVstatus',
    description: 'AV node Reentry Tachycardia',
    effects: {
      node: {
        AN: { forceFiring: true },
      },
      path: {
        'IA->AN_fast': {refractoryMs: 100, },
        'IA->AN_slow': {refractoryMs: 40},
        'IA->AN_fast_retro': {refractoryMs:40},
        'IA->AN_slow_retro': {refractoryMs:100},
      }
    }
  },
  {
    id: 'RESET',
    label: 'rest all nodes and paths',
    group: 'demo',
//    group: 'JunctionStatus',
    //    exclusiveGroup: 'AVstatus',
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
