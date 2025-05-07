//src/engine/UpdateGraph.ts

import { graphControlRules } from '../rules/graphControlRuleList';
import type { SimOptions } from '../types/SimOptions';
import type { Node } from '../types/NodeTypes';
import type { Path } from './graphs/Path';

/** GraphControlRulesのすべてを適用 */
export function updateGraphEngineFromSim(sim: SimOptions, nodes: Record<string, Node>, paths: Path[]) {

  // ✅ 正しい実装（SimOptionsのゲッターを使う！）
  const statuses = sim.statuses;
  console.log("[updateGraph statuses[] = ]", statuses);
  // 対象となるルールを抽出
  const activeRules = graphControlRules.filter(rule => statuses.includes(rule.id));

  for (const rule of activeRules) {
    // ---- Nodeへの適用 ----
    if (rule.effects.node) {
      console.log("[RULE EFFECT]", rule.id, rule.effects.node);
      for (const [nodeId, effect] of Object.entries(rule.effects.node)) {
        const node = nodes[nodeId];
        if (!node) continue;
        if (!effect) continue;

        if (effect.autofire !== undefined) { node.autoFire = effect.autofire; }
        if (effect.refractory !== undefined) { node.refractoryOverrideMs = effect.refractory; }

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
        if (effect.probability !== undefined) path.conductionProbability = effect.probability;
        if (effect.delayMs !== undefined) path.delayMs = effect.delayMs;
        if (effect.refractoryMs !== undefined) path.refractoryMs = effect.refractoryMs;
        if (effect.apdMs !== undefined) path.apdMs = effect.apdMs;
        if (effect.amplitude !== undefined) path.amplitude = effect.amplitude;

        // ほかのプロパティは必要に応じて追加
      }
    }
  }
}
