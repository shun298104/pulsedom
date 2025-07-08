// src/components/ui/RuleControlUI.tsx
import React, { useState } from "react";
import type { UIControl } from "../../rules/GraphControlTypes";
import * as Tooltip from "@radix-ui/react-tooltip";

type RuleControlUIProps = {
  controls: UIControl[];
  values: Record<string, number | string>;
  onChange: (key: string, value: number | string) => void;
};

const wrapWithTooltip = (label: React.ReactNode, tooltip?: string) => {
  if (!tooltip) return label;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span className="inline-block cursor-help">{label}</span>
      </Tooltip.Trigger>
      <Tooltip.Content
        className="bg-teal-500 text-white text-sm font-small font-semibold tracking-wide px-2 py-1 rounded-md shadow-md border border-teal-100 max-w-xs break-words z-50"
        side="top"
        sideOffset={8}
      >
        {tooltip}
        <Tooltip.Arrow className="fill-white" />
      </Tooltip.Content>
    </Tooltip.Root>
  );
};

const RuleControlUI: React.FC<RuleControlUIProps> = ({ controls, values, onChange }) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const handleEditStart = (key: string, current: number) => {
    setEditingKey(key);
    setEditValue(current);
  };

  const commitEdit = (key: string, min: number, max: number) => {
    const clamped = Math.min(max, Math.max(min, editValue));
    onChange(key, clamped);
    setEditingKey(null);
  };

  const cancelEdit = () => {
    setEditingKey(null);
  };

  return (
    <div className="flex flex-col gap-1 mt-1 text-xs">
      {controls.map((ctrl) => {
        switch (ctrl.type) {
          case "slider": {
            const val = values[ctrl.key] as number;
            const isEditing = editingKey === ctrl.key;

            return (

              <label key={ctrl.key} className="flex flex-col">
                <div className="flex justify-between items-center">
                  <span>{wrapWithTooltip(ctrl.label, ctrl.tooltip)}</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(parseFloat(e.target.value))}
                      onBlur={() => commitEdit(ctrl.key, ctrl.min, ctrl.max)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit(ctrl.key, ctrl.min, ctrl.max);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      min={ctrl.min}
                      max={ctrl.max}
                      step={ctrl.step ?? 1}
                      className="w-20 text-right border px-1 rounded text-xs [appearance:textfield]"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="text-gray-500 cursor-pointer select-none"
                      onDoubleClick={() => handleEditStart(ctrl.key, val)}
                      title="Double-click to edit"
                    >
                      {val}
                    </span>
                  )}
                </div>
                <input
                  type="range"
                  min={ctrl.min}
                  max={ctrl.max}
                  step={ctrl.step ?? 1}
                  className="accent-blue-700"
                  value={val}
                  onChange={e => onChange(ctrl.key, Number(e.target.value))}
                />
              </label>
            );
          }
          case "select":
            return (
              <label key={ctrl.key} className="flex flex-col">
                {wrapWithTooltip(ctrl.label, ctrl.tooltip)}
                <select
                  value={values[ctrl.key]}
                  className="rounded border border-gray-400 mt-1"
                  onChange={e => onChange(ctrl.key, e.target.value)}
                >
                  {ctrl.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          case "radio":
            return (
              <div key={ctrl.key} className="flex flex-col">
                <div>{wrapWithTooltip(ctrl.label, ctrl.tooltip)}</div>
                <div className="flex gap-1 flex-wrap">
                  {ctrl.options.map(opt => (
                    <label key={opt.value} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name={ctrl.key}
                        value={opt.value}
                        checked={values[ctrl.key] === opt.value}
                        onChange={() => { onChange(ctrl.key, opt.value); }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            );
        }
      })}
    </div>
  );
};

export default RuleControlUI;
