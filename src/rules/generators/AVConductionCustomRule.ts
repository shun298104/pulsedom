// src/rules/generators/AflCustomRule.ts
import { GraphControlRule } from '../GraphControlTypes';
import { GraphEngine } from '../../engine/GraphEngine';

export const normalConduction: GraphControlRule = {
  id: 'Normal',
  label: 'Normal AV Conduction',
  group: 'conduction_status',
  exclusiveGroup: 'conduction_status',
  description: 'reset AV conduction.',
  effects: {
    path: {
      'N->NH': { block: false, decrementalStep: 0, wenckebachPhenomenon: false },
    },
  },
}

export const firstAVB: GraphControlRule = {
  id: '1AVB',
  label: 'First Degree AV Block',
  group: 'conduction_status',
  exclusiveGroup: 'conduction_status',
  description: 'give extended option(pq time)',
  updateGraph: updateGraphWith_1AVB_CustomArgs,
  effects: {
    path: {
      'N->NH': { block: false, decrementalStep: 0, wenckebachPhenomenon: false },
    },
  },
  uiControls: [
    {
      type: 'slider',
      key: 'pq_time',
      label: 'PQ time',
      min: 100,
      max: 300,
      step: 10,
      defaultValue: 150,
    },]
}
export function updateGraphWith_1AVB_CustomArgs(args: Record<string, number>, graph: GraphEngine) {
  const pq = args.pq_time;
  console.log("[1AVB Custom] PQ time = ", pq)
  graph.getPath('N->NH')?.setDelay(pq - 80);
}

export const WBBlock: GraphControlRule = {
  id: 'WBBlock',
  label: 'Wenckebach 2nd degree AV Block',
  group: 'conduction_status',
  exclusiveGroup: 'conduction_status',
  description: 'Blocks N->NH.',
  updateGraph: updateGraphWith_WBBlock_CustomArgs,
  effects: {
    path: {
      'N->NH': { decrementalStep: 30, wenckebachPhenomenon: true },
    },
  },
  uiControls: [
    {
      type: 'slider',
      key: 'decrementalMs',
      label: 'AV delay increment per beat',
      min: 20,
      max: 100,
      step: 10,
      defaultValue: 40,
    },]
}

export function updateGraphWith_WBBlock_CustomArgs(args: Record<string, number>, graph: GraphEngine) {
  const decStep = args.decrementalMs;
  console.log("[WBBlock Custom] decrementalMs = ", decStep)
  graph.getPath('N->NH')?.setDecrementalStep(decStep);
}

export const M2Block: GraphControlRule = {
  id: 'M2Block',
  label: 'Mobitz type II 2nd degree AV Block',
  group: 'conduction_status',
  exclusiveGroup: 'conduction_status',
  description: 'Blocks N->NH.',
  effects: {
    path: {
      'N->NH': { decrementalStep: 30, wenckebachPhenomenon: false },
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
      'N->NH': { block: true, decrementalStep: 0, wenckebachPhenomenon: false },
    },
  },
}

