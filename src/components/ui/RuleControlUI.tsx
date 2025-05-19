//src/components/ui/RuleControlUI.tsx

import { GraphControlRule } from '../../rules/GraphControlTypes';

export function RuleControlUI({
  rule,
  options,
  onOptionsChange,
}: {
  rule: GraphControlRule | undefined;
  options: Record<string, number>;
  onOptionsChange: (key: string, value: number) => void;
}) {
  if (!rule?.uiControls) return null;

  return (
    <div className="flex flex-col gap-2 mt-2 text-xs">
      {rule.uiControls.map(ctrl => {
        if (ctrl.type === 'slider') {
          const value = options[ctrl.key] ?? ctrl.defaultValue;
          return (
            <label key={ctrl.key} className="flex flex-col">
              {ctrl.label} ({value})
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step ?? 1}
                value={value}
                onChange={(e) => onOptionsChange(ctrl.key, Number(e.target.value))}
                className="accent-green-800"
              />
            </label>
          );
        }
        return null;
      })}
    </div>
  );
}
