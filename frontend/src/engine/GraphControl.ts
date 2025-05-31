//src/engine/UpdateGraph.ts

import { graphControlRules } from '../rules/graphControlRuleList';
import type { SimOptions } from '../types/SimOptions';
import { GraphEngine } from './GraphEngine';

/** GraphControlRulesのすべてを適用 */
export function updateGraphEngineFromSim(sim: SimOptions,  graph: GraphEngine) {
  const nodes = graph.nodes;
  const paths = graph.getPaths();

  nodes['SA'].bpm = sim.sinusRate;
  nodes['NH'].bpm = sim.junctionRate;
  nodes['PLV3BS'].bpm = sim.ventricleRate;

  const statuses = sim.statuses;
  console.log('[GC] statuses', statuses);

  const activeRules = graphControlRules.filter(rule => statuses.includes(rule.id));

  for (const rule of activeRules) {
    // ---- Nodeへの適用 ----
    if (!rule.effects) continue;
    if (rule.effects.node) {
      for (const [nodeId, effect] of Object.entries(rule.effects.node)) {
        const node = nodes[nodeId];
        if (!node) continue;
        if (!effect) continue;
        
        if (effect.refractory !== undefined) { node.primaryRefractoryMs = effect.refractory; }

        if (effect.autofire !== undefined) { node.CONFIG.autoFire = effect.autofire; }
        if (effect.forceFiring !== undefined) { node.CONFIG.forceFiring = effect.forceFiring; }

        // 将来的なectopicOptionsなどの適用処理はここに追記する
      }
    }

    // ---- Pathへの適用 ----
    if (rule.effects.path) {
      for (const [pathId, effect] of Object.entries(rule.effects.path)) {
        const path = paths.find(p => p.id === pathId);
        if (!path) continue;
        if (!effect) continue;

        if (effect.block !== undefined) path.blocked = effect.block;
        if (effect.probability !== undefined) {
          path.conductionProbability = effect.probability;
        }
        if (effect.delayMs !== undefined) path.delayMs = effect.delayMs;
        if (effect.refractoryMs !== undefined) path.refractoryMs = effect.refractoryMs;
        if (effect.delayJitterMs !== undefined) path.delayJitterMs = effect.delayJitterMs;
        if (effect.apdMs !== undefined) path.apdMs = effect.apdMs;
        if (effect.amplitude !== undefined) path.amplitude = effect.amplitude;
        if (effect.decrementalStep !== undefined) path.decrementalStep = effect.decrementalStep
        if (effect.wenckebachPhenomenon !== undefined) path.wenckebachPhenomenon = effect.wenckebachPhenomenon

        // ほかのプロパティは必要に応じて追加
      }
    }
    // カスタムupdateGraph()が定義されていれば呼び出す
    if (rule.updateGraph) {
      const options = sim.getOptionsForStatus(rule.id);
      rule.updateGraph(options, graph);
    }
  }
}
