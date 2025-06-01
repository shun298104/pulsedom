// src/components/WaveformSlider.tsx
import React, { useState, useEffect } from 'react';

interface WaveformSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  digits?: number;
  onChange: (v: number) => void;
  colorClass?: string;

}

const WaveformSlider: React.FC<WaveformSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  digits = 2,
  onChange,
  colorClass,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const commitEdit = () => {
    const clamped = Math.min(max, Math.max(min, editValue));
    onChange(clamped);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue(value);
  };

  return (
    <div className="mb-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-gray-700">{label}</label>
        {isEditing ? (
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(parseFloat(e.target.value))}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            min={min}
            max={max}
            step={step}
            className="w-20 text-right border px-1 rounded text-xs [appearance:textfield]" 
            autoFocus
          />
        ) : (
          <span
            className="text-xs text-gray-500 cursor-pointer select-none"
            onDoubleClick={() => setIsEditing(true)}
            title="Double-click to edit"
          >
            {Number.isFinite(value) ? value.toFixed(digits) : '-'} {unit}
          </span>
        )}
      </div>
      <input
        type="range"
        className={`w-full accent-current ${colorClass ?? ''}`}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
};

export default WaveformSlider;
