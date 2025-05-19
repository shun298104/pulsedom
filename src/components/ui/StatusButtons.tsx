// src/components/ui/StatusButtons.tsx

import { graphControlRules } from '../../rules/graphControlRuleList';
import type { GraphControlGroup, GraphControlRule } from '../../rules/GraphControlTypes';
import { SimOptions } from '../../types/SimOptions';

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

interface Props {
  group: GraphControlGroup;
  current: string;
  simOptions: SimOptions;
  onSimOptionsChange: (next: SimOptions) => void;
}

export function StatusButtons({
  group,
  current,
  simOptions,
  onSimOptionsChange,
}: Props) {
  const options = graphControlRules.filter(rule => rule.group === group);

  return (
    <div className="flex gap-2 text-xs">
      {options.map((rule: GraphControlRule) => (
        <button
          key={rule.id}
          className={`px-2 py-1 rounded border ${
            current === rule.id ? 'bg-zinc-300' : 'bg-white'
          }`}
          onClick={() => {
            const updated = applyRuleToSimOptions(rule, simOptions);
            onSimOptionsChange(updated); 
          }}
        >
          {rule.label}
        </button>
      ))}
    </div>
  );
}
