//src/components/ui/StatusBUttons.tsx
import { graphControlRules } from "../../rules/graphControlRuleList";
import { GraphControlGroup} from "../../rules/GraphControlTypes"

export function StatusButtons({
  group,
  current,
  setSinusStatus,
}: {
  group: GraphControlGroup;
  current: string;
  setSinusStatus: (s: string) => void;
}) {
  const options = [] as string[];
  graphControlRules.forEach(rule => {
    if (group === rule.group) {
      options.push(rule.id);
    }
  });
  return (
    <div className="flex gap-2 text-xs">
      {options.map((s) => (
        <button
          key={s}
          className={`px-2 py-1 rounded border ${
            current === s ? "bg-zinc-300" : "bg-white"
          }`}
          onClick={() => setSinusStatus(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
