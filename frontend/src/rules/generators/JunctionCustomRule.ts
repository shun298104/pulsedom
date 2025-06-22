//src/rules/generators/JunctionCustomRule.ts

import { GraphControlRule } from '../GraphControlTypes';
import { GraphEngine } from '../../engine/GraphEngine';

export const junc_Normal: GraphControlRule = {
    id: 'junc_Normal',
    label: 'Junction Normal Status',
    group: 'junction_status',
    exclusiveGroup: 'AVstatus',
    description: 'Normal Juncational Status',
    effects: {
        node: {
            AN: { refractory: 250 },
            LA: { refractory: 75, },

        },
        path: {
            'A->IA': { block: false },
            'IA->AN_fast': { refractoryMs: 250, block: false },
            'IA->AN_slow_1': { refractoryMs: 40 },
            'IA->AN_fast_retro': { refractoryMs: 275 },
            'IA->AN_slow_retro_1': { refractoryMs: 250, block: false },
        }
    }

}

export const AVNRT: GraphControlRule = {
    id: 'AVNRT',
    label: 'AVNRT',
    group: 'junction_status',
    exclusiveGroup: 'AVstatus',
    description: 'AV node Re-entry Tachycardia',
    effects: {
        node: {
            AN: { forceFiring: true, refractory: 100 },
            LA: { refractory: 150, },

        },
        path: {
            'A->IA': { block: true },
            'IA->AN_fast': { refractoryMs: 100, block: true },
            'IA->AN_slow_1': { refractoryMs: 40 },
            'IA->AN_fast_retro': { refractoryMs: 20 },
            'IA->AN_slow_retro_1': { refractoryMs: 100, block: true },
        }
    }
}