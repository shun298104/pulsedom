// src/components/VitalDisplay.tsx
import React, { useRef, useState } from 'react';
import { VitalParameter } from '../models/VitalParameter';

interface VitalDisplayProps {
  param: VitalParameter;
  value: number;
  setValue: (v: number) => void;
}

const VitalDisplay: React.FC<VitalDisplayProps> = ({ param, value, setValue }) => {
  const startYRef = useRef<number | null>(null);
  const tempValRef = useRef<number>(value);
  const [localVal, setLocalVal] = useState<number>(value);

  const handlePointerDown = (e: React.PointerEvent) => {
    startYRef.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startYRef.current !== null) {
      const deltaY = startYRef.current - e.clientY;
      const deltaVal = Math.round(deltaY / param.sensitivity);
      const newVal = param.clamp(value + deltaVal);
      tempValRef.current = newVal;
      setLocalVal(newVal);
    }
  };

  const handlePointerUp = () => {
    startYRef.current = null;
    setValue(tempValRef.current);
    console.log("🔥 VitalDisplay変更要求:", tempValRef.current);
  };

  const getBgColor = (): string => {
    if (param.isCritical(localVal)) return 'bg-red-500';
    if (param.isWarning(localVal)) return 'bg-yellow-500';
    return 'bg-black';
  };

  const getTextColor = (): string => {
    return param.color; // 常に固定色
  };

  return (
    <div
      className={`select-none cursor-ns-resize rounded-xl p-4 shadow-xl hover:scale-105 transition duration-150 ease-out ${getBgColor()}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <span className={`text-6xl font-bold ${getTextColor()}`}>
        {param.format(localVal)}
      </span>
      <span className="ml-2 text-gray-400 text-xl">{param.unit}</span>
    </div>
  );
};

export default VitalDisplay;
