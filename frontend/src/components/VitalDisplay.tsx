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
    if (tempValRef.current !== localVal) {
      setValue(tempValRef.current);
    }
    console.log("🔥 VitalDisplay変更要求:", tempValRef.current);
    setValue(tempValRef.current);
};

  const getColor = (): string => {
    if (param.isCritical(localVal)) return 'text-red-400';
    if (param.isWarning(localVal)) return 'text-yellow-300';
    return param.color;
  };

  return (
    <div className="select-none cursor-ns-resize rounded-xl p-4 shadow-xl hover:scale-105 transition duration-150 ease-out"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ backgroundColor: 'black' }}
    >
      <span className={`text-6xl font-bold ${getColor()}`}>
        {param.format(localVal)}
      </span>
      <span className="ml-2 text-gray-400 text-xl">{param.unit}</span>
    </div>
  );
};

export default VitalDisplay;
