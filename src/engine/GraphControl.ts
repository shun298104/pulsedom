//src/engine/UpdateGraph.ts

import { graphControlRules } from '../rules/graphControlRuleList';
import { GraphEngine } from './GraphEngine';
import type { SimOptions } from '../types/SimOptions';
import type { Node } from '../types/NodeTypes';
import type { Path } from './graphs/Path';

/** GraphControlRulesのすべてを適用 */
export function updateGraphEngineFromSim(sim: SimOptions, nodes: Record<string, Node>, paths: Path[]) {

  nodes['SA'].bpm = sim.sinusRate;
  nodes['NH'].bpm = sim.junctionRate;
//  nodes['RV'].bpm = sim.ventricleRate;

  const statuses = sim.statuses;
  console.log('[GC] statuses', statuses);
  // 対象となるルールを抽出
  const activeRules = graphControlRules.filter(rule => statuses.includes(rule.id));

  for (const rule of activeRules) {
    // ---- Nodeへの適用 ----
    if (!rule.effects) continue;
    if (rule.effects.node) {
      for (const [nodeId, effect] of Object.entries(rule.effects.node)) {
        const node = nodes[nodeId];
        if (!node) continue;
        if (!effect) continue;

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

        // ほかのプロパティは必要に応じて追加
      }
    }
  }
}
export function applyRatesToNodes(graph: GraphEngine, simOptions: SimOptions) {
  // Sinus node
  const sa = graph.getNode('SA');
  if (sa && simOptions.sinusRate !== undefined) sa.bpm = simOptions.sinusRate;

  // Junction node (NH)
  const nh = graph.getNode('NH');
  if (nh && simOptions.junctionRate !== undefined) nh.bpm = simOptions.junctionRate;

  // Ventricle node (RV)
  const rv = graph.getNode('RV');
  if (rv && simOptions.ventricleRate !== undefined) rv.bpm = simOptions.ventricleRate;
}