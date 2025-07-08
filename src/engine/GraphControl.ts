//src/engine/GraphControl.ts

import { graphControlRules } from '../rules/graphControlRuleList';
import type { SimOptions } from '../types/SimOptions';
import { GraphEngine } from './GraphEngine';

/** GraphControlRulesのすべてを適用 */
/** GraphControlRulesのすべてを適用（CONFIG/STATE分離構造対応版） */
export function updateGraphEngineFromSim(sim: SimOptions, graph: GraphEngine) {
  const nodes = graph.nodes;
  const paths = graph.getPaths();

  nodes['SA'].bpm = sim.sinusRate;
  nodes['NH'].bpm = sim.junctionRate;
  nodes['PLV3BS'].bpm = sim.ventricleRate;

  const statuses = sim.statuses;
  console.log('[GC] statuses', statuses);

  const activeRules = graphControlRules.filter(rule => statuses.includes(rule.id));

  for (const rule of activeRules) {
    if (!rule.effects) continue;

    // ---- Nodeへの適用 ----
    if (rule.effects.node) {
      for (const [nodeId, effect] of Object.entries(rule.effects.node)) {
        const node = nodes[nodeId];
        if (!node || !effect) continue;

        // CONFIGプロパティ
        if (effect.refractory !== undefined) node.CONFIG.refractoryMs = effect.refractory;
        if (effect.autofire !== undefined) node.CONFIG.autoFire = effect.autofire;
        if (effect.forceFiring !== undefined) node.CONFIG.forceFiring = effect.forceFiring;
        // 必要に応じてCONFIG/STATEプロパティを追加（例: ectopicOptions など）

        // STATE直書きが必要な場合はここで処理
        // 例: node.STATE.〇〇 = effect.〇〇 など
      }
    }

    // ---- Pathへの適用 ----
    if (rule.effects.path) {
      for (const [pathId, effect] of Object.entries(rule.effects.path)) {
        const path = paths.find(p => p.id === pathId);
        if (!path || !effect) continue;

        // CONFIGプロパティ
        if (effect.block !== undefined) path.CONFIG.blocked = effect.block;
        if (effect.probability !== undefined) path.CONFIG.conductionProbability = effect.probability;
        if (effect.delayMs !== undefined) path.CONFIG.delayMs = effect.delayMs;
        if (effect.refractoryMs !== undefined) path.CONFIG.refractoryMs = effect.refractoryMs;
        if (effect.delayJitterMs !== undefined) path.CONFIG.delayJitterMs = effect.delayJitterMs;
        if (effect.apdMs !== undefined) path.CONFIG.apdMs = effect.apdMs;
        if (effect.amplitude !== undefined) path.CONFIG.amplitude = effect.amplitude;
        if (effect.decrementalStep !== undefined) path.CONFIG.decrementalStep = effect.decrementalStep;
        if (effect.wenckebachPhenomenon !== undefined) path.CONFIG.wenckebachPhenomenon = effect.wenckebachPhenomenon;
        // 必要に応じてCONFIG/STATEプロパティを追加

        // STATE直書きが必要な場合はここで処理
        // 例: path.STATE.〇〇 = effect.〇〇 など
      }
    }

    // カスタムupdateGraph()が定義されていれば呼び出す
    if (rule.updateGraph) {
      const options = sim.getOptionsForStatus(rule.id);
      rule.updateGraph(options, graph);
    }
  }
}