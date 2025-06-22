//src/rules/graphControlRuleList.ts
import type { GraphControlRule } from './GraphControlTypes';
import { Af } from './generators/AfCustomRule';
import { Afl } from './generators/AflCustomRule';
import { CAVB, normalConduction, WBBlock, M2Block, firstAVB } from './generators/AVConductionCustomRule';
import { PACs } from './generators/PACsCustomRule'
import { SAB2 } from './generators/SSSCustomRule'
import { junc_Normal, AVNRT } from './generators/JunctionCustomRule';

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
        His: { refractory: 275 },
        IA: { refractory: 150 }

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
  Af,
  Afl,
  SAB2,
//  PACs,
  normalConduction,
  firstAVB,
  WBBlock,
  M2Block,
  CAVB,
//  junc_Normal,
//  AVNRT,

];

export const ruleMap = Object.fromEntries(
  graphControlRules.map(rule => [rule.id, rule])
);


export function getDefaultOptionsFromRules(rules: GraphControlRule[]): Record<string, number> {
  const options: Record<string, number> = {};

  for (const rule of rules) {
    if (!rule.uiControls) continue;

    for (const ctrl of rule.uiControls) {
      const { key, defaultValue } = ctrl;

      if (typeof defaultValue === 'number') {
        const prefixedKey = `${rule.id}.${key}`;
        options[prefixedKey] = defaultValue;
      }
    }
  }
  return options;
}