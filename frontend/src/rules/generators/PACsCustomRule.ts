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
        node: {
            CT: { forceFiring: true },
        },
    },
    uiControls: [
        {
            type: 'radio',
            key: 'PACburst',
            label: 'PAC burst',
            options: [
                { value: 'PAC1', label: 'single' },
                { value: 'PAC2', label: 'couplet' },
                { value: 'PAC3', label: 'triplet' },
                { value: 'PAC+', label: 'more' },
            ],
            defaultValue: 'PAC1',
        },
        {
            type: 'slider',
            key: 'intensity',
            label: 'PAC intensity',
            min: 0,
            max: 10,
            step: 1,
            defaultValue: 5,
        },
    ],
};

export function updateGraphWithPACsCustomArgs(args: Record<string, number>, graph: GraphEngine) {
    console.log("[PACsCustom]",args)
    const PACs = args.PACburst;
    const PAC_intensity = args.intensity;
    console.log("[PACsCustom]", PACs, PAC_intensity, graph);
}
