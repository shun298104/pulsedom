//src/rules/graphControlRuleList.ts
import type { GraphControlRule } from './GraphControlTypes';
import { Af } from './generators/AfCustomRule';
import { Afl } from './generators/AflCustomRule';
import { CAVB, normalConduction } from './generators/AVbkocksCustomRule';
import { PACs } from './generators/PACsCustomRule'

export const graphControlRules: GraphControlRule[] = [

  {
    id: 'NSR',
    label: 'Normal Sinus Rhythm',
    group: 'sinus_status',
    exclusiveGroup: 'AtrialArrhythmia',
    description: 'Default atrial conduction. Enables SA node and IA conduction.',
    effects: {
      node: {
        SA: { autofire: true },
      His: { refractory: 275}
      },
      path: {
        'A->IA': { block: false, },
        'IA->A': { block: false, },
        //reset Af
        'LA->PV1': { block: true, },
        'PV1->PV2': { block: true, },
        'PV2->LA': { block: true, },
        'LA->IA': { block: true, },
        //rest AFL
        'IA->CTI1': { block: true, },
        'IA->AN_fast': { probability: undefined },
        'IA->AN_slow_1': { probability: undefined },
      }
    }
  },
  Af,
  Afl,
  PACs,
  normalConduction,
  CAVB,
  {
    id: 'Arrest',
    label: 'Sinus Arrest',
    group: 'sinus_status',
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
    group: 'junction_status',
    exclusiveGroup: 'AVstatus',
    description: 'AV node Re-entry Tachycardia',
    effects: {
      node: {
        AN: { forceFiring: true,refractory: 100 },
        LA: { refractory: 150, },

      },
      path: {
        'A->IA': {block: true},
        'IA->AN_fast': { refractoryMs: 100, block: true },
        'IA->AN_slow': { refractoryMs: 40 },
        'IA->AN_fast_retro': { refractoryMs: 20 },
        'IA->AN_slow_retro': { refractoryMs: 100, block: true },
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

export const ruleMap = Object.fromEntries(
  graphControlRules.map(rule => [rule.id, rule])
);
