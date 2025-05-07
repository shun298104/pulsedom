// src/components/VitalDisplay.tsx
import React from 'react';
import { VitalParameter } from '../models/VitalParameter';

interface VitalDisplayProps {
  param: VitalParameter;
  value: number;
  display?: string;
}

const VitalDisplay: React.FC<VitalDisplayProps> = ({ param, value, display }) => {
  const getBgColorClass = (): string => {
    if (param.isCritical(value)) return 'bg-red-500';
    if (param.isWarning(value)) return 'bg-yellow-500';
    return 'bg-black';
  };

  const getTextColor = (): string => {
    if (param.isCritical(value) || param.isWarning(value)) {
      return 'text-black';
    }
    return param.color;
  };

  return (
    <div className={`relative select-none rounded-2xl p-4 shadow-xl ${getBgColorClass()} ${getTextColor()}`}>
      {/* アラーム範囲表示 */}
      <div className={`absolute top-2 left-2 text-sm font-bold ${param.color}`}>
        <div>{param.alarm.warnHigh}</div>
        <div>{param.alarm.warnLow}</div>
      </div>

      {/* メイン数値表示 */}
      <span className={`text-6xl font-mono tabular-nums text-right block ${getTextColor()}`}>
        {display ?? param.format(value)}
      </span>

      {/* 単位表示 */}
      <span className="ml-2 text-gray-400 text-xl">{param.unit}</span>
    </div>
  );
};

export default VitalDisplay;
