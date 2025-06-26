// src/components/VitalDisplay.tsx
import React, { useState } from 'react';
import { VitalParameter } from '../../types/VitalParameter';

interface VitalDisplayProps {
  param: VitalParameter;
  value?: number;
  display?: string;
  onAlarmChange?: (paramId: string, newLimits: { warnHigh: number; warnLow: number }) => void;
}

const VitalDisplay: React.FC<VitalDisplayProps> = ({ param, value, display }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempHigh, setTempHigh] = useState(param.alarm.warnHigh);
  const [tempLow, setTempLow] = useState(param.alarm.warnLow);

  const getBgColorClass = (): string => {
    if (value === -1) return 'bg-gray-900';
    if (param.isCritical(value)) return 'bg-red-500';
    if (param.isWarning(value)) return 'bg-yellow-500';
    return 'bg-gray-900';
  };

  const getTextColor = (): string => {
    if (param.isCritical(value) || param.isWarning(value)) {
      return 'text-black';
    }
    return param.color;
  };

  const handleSave = () => {
    // 直接VitalParameterインスタンスのアラームを更新
    param.alarm.warnHigh = tempHigh;
    param.alarm.warnLow = tempLow;
    setIsModalOpen(false);
  };

  return (
    <div className={`relative select-none rounded-md p-4 shadow-xl ${getBgColorClass()} ${getTextColor()} h-full flex flex-col justify-between`}>
      {/* ラベル（上部中央） */}
      <div className={`top-2 text-base font-semibold mb-1 ${getTextColor()}  lg:text-lg`}>
        {param.label}
      </div>

      {/* アラーム範囲（右上） */}
      <div
        className={`absolute top-2 right-2 text-xs font-bold cursor-pointer text-right ${getTextColor()} lg:text-sm`}
        onClick={() => setIsModalOpen(true)}
      >
        <div>{param.alarm.warnHigh}</div>
        <div>{param.alarm.warnLow}</div>
      </div>

      {/* 単位（右下） */}
      <div className={`absolute bottom-2 right-2 text-xs font-bold ${getTextColor()} lg:text-sm`}>
        {param.unit && `[${param.unit}]`}
      </div>

      {/* メイン数値 + 単位 */}
      <div className="flex items-end justify-center relative">
        <span className={`text-5xl font-mono tabular-nums text-right block ${getTextColor()} lg:text-6xl`}>
          {display ?? param.format(value)}
        </span>

        {param.key === 'nibp_dia' ? (
          <div
            className={`absolute right-full text-5xl font-mono leading-none ${getTextColor()} lg:text-6xl`}
            style={{
              top: '45%',
              transform: 'translate(0.4rem, -50%)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            /
          </div>
        ) : null}
      </div>

      {/* アラーム設定モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 text-black flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-60">
            <div className="text-xl font-bold mb-4">{param.label} <span className="text-lg">Alarm Limits</span></div>
            <div className="mb-4">
              <label className="block text-sm font-semibold">High Limit</label>
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
