//src/rules/generators/PACsCustomRule.ts

import { GraphControlRule } from '../GraphControlTypes';
import { GraphEngine } from '../../engine/GraphEngine';

export const PACs: GraphControlRule = {
    id: 'PACs',
    label: 'Premature Atrial Contraction',
    group: 'sinus_status',
    exclusiveGroup: 'AtrialArrhythmia',
    description: '',
    updateGraph: updateGraphWithPACsCustomArgs,
    effects: {
    },
    uiControls: [
        {
            type: 'slider',
            key: 'PACs',
            label: 'PAC intensity',
            min: 0,
            max: 10,
            step: 1,
            defaultValue: 1,
        },
    ],
};

export function updateGraphWithPACsCustomArgs(args: Record<string, number>,   graph: GraphEngine) {
    const PACs = args.PACs ?? 1;
    console.log("[PACsCustom]", PACs, graph);
}
