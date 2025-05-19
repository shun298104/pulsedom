import { GraphControlRule } from '../rules/GraphControlTypes';
import { SimOptions } from '../types/SimOptions';

export function applyRuleToSimOptions(rule: GraphControlRule, sim: SimOptions): SimOptions {
  const next = new SimOptions(sim);

  // ステータスを設定（groupに応じて）
  if (rule.group === 'AtrialStatus') next.sinus_status = rule.id;
  if (rule.group === 'JunctionStatus') next.junction_status = rule.id;
  if (rule.group === 'VentricleStatus') next.ventricle_status = rule.id;

  // uiControlsからoptionsを設定（主に静的ルール用）
  rule.uiControls?.forEach(ctrl => {
    if ('key' in ctrl && ctrl.defaultValue !== undefined) {
      next.setOption(ctrl.key, ctrl.defaultValue);
    }
  });

  return next;
}
