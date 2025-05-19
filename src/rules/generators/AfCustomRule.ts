import { GraphControlRule } from '../GraphControlTypes';
import { GraphEngine } from '../../engine/GraphEngine';

export const Af: GraphControlRule = {
    id: 'Af',
    label: 'Atrial Fibrillation',
    group: 'AtrialStatus',
    exclusiveGroup: 'AtrialArrhythmia',
    description: 'Blocks A→IA and applies probabilistic conduction from IA to AN. SA node suppressed.',
    effects: {
        node: {
            SA: { autofire: false },
            LA: { forceFiring: true },
        },
        path: {
            'A->IA': { block: true },
            'A->IA_retro': { block: true },
            'A->LA': { block: true },
            'LA->IA': { block: false, delayJitterMs: 30 },
            'LA->PV1': { block: false },
            'PV1->PV2': { block: false },
            'PV2->LA': { block: false },
            'IA->AN_fast': { probability: 0.3 },
            'IA->AN_slow': { probability: 0.3 },
        },
    },
    uiControls: [
        {
            type: 'slider',
            key: 'fWaveFreq',
            label: 'f-wave frequency',
            min: 300,
            max: 600,
            step: 10,
            defaultValue: 400,
        },
        {
            type: 'slider',
            key: 'fWaveAmp',
            label: 'f-wave amplitude',
            min: 0.1,
            max: 0.2,
            step: 0.02,
            defaultValue: 0.5,
        },
        {
            type: 'slider',
            key: 'CosnductProbability',
            label: 'CosnductProbability',
            min: 0.1,
            max: 0.8,
            step: 0.1,
            defaultValue: 0.3,
        },
    ],
};


export function updateGraphWithAfCustomArgs(args: Record<string, number>,   graph: GraphEngine) {
    const f = args.fWaveFreq ?? 400;
    const a = args.fWaveAmp ?? 0.05;
    const p = args.conductProb ?? 0.3;
    const delayMs = Math.floor(1000 / (f / 60) / 3) - 7;
    console.log("[AfCustom]", f, a, p, delayMs);

    // Graph内でパス取得してパラメータ更新
    graph.getPath('LA->PV1')?.setDelay(delayMs); // apdMs, polarityも値を指定
    graph.getPath('PV1->PV2')?.setDelay(delayMs);
    graph.getPath('PV2->LA')?.setDelay(delayMs);

    graph.getPath('LA->PV1')?.setAmplitude(a); // apdMs, polarityも値を指定
    graph.getPath('PV1->PV2')?.setAmplitude(a);
    graph.getPath('PV2->LA')?.setAmplitude(a);

    graph.getPath('IA->AN_fast')?.setConductionProbability(p); 
    graph.getPath('IA->AN_slow')?.setConductionProbability(p); 
}
