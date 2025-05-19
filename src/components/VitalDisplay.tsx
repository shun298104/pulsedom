// src/components/VitalDisplay.tsx
import React, { useState, useRef } from 'react';
import { VitalParameter } from '../types/VitalParameter';

interface VitalDisplayProps {
  param: VitalParameter;
  value: number;
  display?: string;
  onAlarmChange?: (paramId: string, newLimits: { warnHigh: number; warnLow: number }) => void;
}

const VitalDisplay: React.FC<VitalDisplayProps> = ({ param, value, display }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempHigh, setTempHigh] = useState(param.alarm.warnHigh);
  const [tempLow, setTempLow] = useState(param.alarm.warnLow);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    // 直接VitalParameterインスタンスのアラームを更新
    param.alarm.warnHigh = tempHigh;
    param.alarm.warnLow = tempLow;
    setIsModalOpen(false);
  };

  const canvas = canvasRef.current;
  const ctx = canvas?.getContext('2d');

  if (ctx && canvas) {
    console.log('Canvas size:', canvas.width, canvas.height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width, canvas.height / 2);
    ctx.lineTo(canvas.width - 5, canvas.height / 2 - 10);
    ctx.stroke();
  }

  return (
    <div className={`relative select-none rounded-sm p-4 shadow-xl ${getBgColorClass()} ${getTextColor()} h-full flex flex-col justify-between`}>
      {/* ラベル（上部中央） */}
      <div className={`top-4 text-lg font-semibold mb-1 ${getTextColor()}`}>
        {param.label}
      </div>

      {/* アラーム範囲（左上） */}
      <div
        className={`absolute top-2 right-2 text-sm font-bold cursor-pointer ${getTextColor()}`}
        onClick={() => setIsModalOpen(true)}
      >
        <div>{param.alarm.warnHigh}</div>
        <div>{param.alarm.warnLow}</div>
      </div>


      {/* メイン数値 + 単位 */}
      <div className="flex items-end justify-center">
        <span className={`text-6xl font-mono tabular-nums text-right block ${getTextColor()}`}>
          {display ?? param.format(value)}
        </span>
        {param.unit && (
          <span className={`text-3xl font-mono tabular-nums text-right ${getTextColor()}`}>
            {param.unit}
          </span>
        )}
        {param.key === 'nibp_sys' ? (
          <div className={`absolute right-0  text-6xl font-mono block ${getTextColor()}`}>

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
