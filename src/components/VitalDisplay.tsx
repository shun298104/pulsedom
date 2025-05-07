// src/components/VitalDisplay.tsx
import React, { useState } from 'react';
import { VitalParameter } from '../models/VitalParameter';

interface VitalDisplayProps {
  param: VitalParameter;
  value: number;
  display?: string;
  onAlarmChange?: (paramId: string, newLimits: { warnHigh: number; warnLow: number }) => void;
}

const VitalDisplay: React.FC<VitalDisplayProps> = ({ param, value, display, onAlarmChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempHigh, setTempHigh] = useState(param.alarm.warnHigh);
  const [tempLow, setTempLow] = useState(param.alarm.warnLow);

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

  const handleSave = () => {
    if (onAlarmChange) {
      onAlarmChange(param.key, { warnHigh: tempHigh, warnLow: tempLow });
    }
    setIsModalOpen(false);
  };

  return (
    <div className={`relative select-none rounded-2xl p-4 shadow-xl ${getBgColorClass()} ${getTextColor()}`}>
      {/* アラーム範囲表示 */}
      <div 
        className={`absolute top-2 left-2 text-sm font-bold cursor-pointer ${getTextColor()}`}
        onClick={() => setIsModalOpen(true)}
      >
        <div>{param.alarm.warnHigh}</div>
        <div>{param.alarm.warnLow}</div>
      </div>

      {/* メイン数値表示 */}
      <span className={`text-6xl font-mono tabular-nums text-right block ${getTextColor()}`}>
        {display ?? param.format(value)}
      </span>

      {/* 単位表示 */}
      <span className="ml-2 text-gray-400 text-xl">{param.unit}</span>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 text-black flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-60">
            <div className="text-xl font-bold mb-4">{param.label} <span className="text-lg">Alarm Limits</span></div>
            <div className="mb-4">
              <label className="block text-sm font-semibold ">High Limit</label>
              <input
                type="number"
                value={tempHigh}
                onChange={(e) => setTempHigh(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:outline-none"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold">Low Limit</label>
              <input
                type="number"
                value={tempLow}
                onChange={(e) => setTempLow(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalDisplay;
