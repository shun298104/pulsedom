//src/rules/generators/PACsCustomRule.ts

import { GraphControlRule } from '../GraphControlTypes';
import { GraphEngine } from '../../engine/GraphEngine';

export const SAB2: GraphControlRule = {
    id: 'SAB2',
    label: '1st Degree Sinoatrial Block',
    group: 'sinus_status',
    exclusiveGroup: 'AtrialArrhythmia',
    description: '',
    updateGraph: updateGraphWith_SAB2_CustomArgs,
    effects: {
        path: {
            'SA->CT': { decrementalStep: 40, wenckebachPhenomenon: true },
        },
    },
    uiControls: [
        {
            type: 'slider',
            key: 'SAdecrementalMs',
            label: 'SA-A delay increment per beat',
            min: 10,
            max: 100,
            step: 10,
            defaultValue: 40,
        },]
};

export function updateGraphWith_SAB2_CustomArgs(args: Record<string, number>, graph: GraphEngine) {
    const decStep = args.SAdecrementalMs
    graph.getPath('SA->CT')?.setDecrementalStep(decStep);
    console.log("[SAB2Custom]", decStep)
}
