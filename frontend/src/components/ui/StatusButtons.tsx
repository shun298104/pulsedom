import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip'; // ← 追加！
import { SimOptions } from '../../types/SimOptions';
import { ruleMap } from '../../rules/graphControlRuleList';
import RuleControlUI from './RuleControlUI';

interface StatusButtonsProps {
  group: string;
  current: string;
  simOptions: SimOptions;
  handleSimOptionsChange: (next: SimOptions) => void;
}

const getStatusesByGroup = (group: string): string[] => {
  return Object.values(ruleMap)
    .filter(rule => rule.group === group)
    .map(rule => rule.id);
};

const StatusButtons: React.FC<StatusButtonsProps> = ({
  group,
  current,
  simOptions,
  handleSimOptionsChange,
}) => {
  const statuses = getStatusesByGroup(group);

  const handleClick = (status: string) => {
    const next = simOptions.clone();
    next.setStatus(group, status);
    handleSimOptionsChange(next);
  };

  const ruleId = current;
  const rule = ruleMap[ruleId];
  const extendedKey = ruleId.toLowerCase();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Tooltip.Provider>
          {statuses.map((status) => {
            const rule = ruleMap[status];
            return (
              <Tooltip.Root key={status}>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => handleClick(status)}
                    className={`px-3 py-1 rounded border text-xs font-medium tracking-wide transition ${current === status
                        ? 'bg-zinc-300 text-green-700 border-zinc-400'
                        : 'hover:bg-zinc-200 border-zinc-400'
                      }`}
                  >
                    {status}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="bg-teal-500 text-white text-sm font-small font-semibold tracking-wide px-2 py-1 rounded-md shadow-md border border-teal-100 max-w-xs break-words z-50"
                  side="top"
                  sideOffset={4}
                >
                  {rule?.label ?? ''}
                  <Tooltip.Arrow className="fill-black" />
                </Tooltip.Content>
              </Tooltip.Root>
            );
          })}
        </Tooltip.Provider>
      </div>

      {rule?.uiControls && (
        <RuleControlUI
          controls={rule.uiControls}
          values={simOptions.getOptionsForStatus(extendedKey)}
          onChange={(key, value) => {
            const next = simOptions.clone();
            next.setExtendedOption(extendedKey, key, value);
            handleSimOptionsChange(next);
          }}
        />
      )}
    </div>
  );
};

export default StatusButtons;
