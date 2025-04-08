import React, { useRef } from 'react';

interface HrDisplayProps {
  hr: number;
  setHr: (value: number) => void;
}

const HrDisplay: React.FC<HrDisplayProps> = ({ hr, setHr }) => {
  const startYRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    startYRef.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startYRef.current !== null) {
      const deltaY = startYRef.current - e.clientY;
      const deltaHr = Math.floor(deltaY / 5); // 5px動かすごとにHR1変化
      const newHr = Math.min(180, Math.max(30, hr + deltaHr));
      if (newHr !== hr) {
        setHr(newHr);
        startYRef.current = e.clientY; // リセットで連続スムーズ
      }
    }
  };

  const handlePointerUp = () => {
    startYRef.current = null;
  };

  return (
    <div
      className="text-green-300 text-6xl font-bold select-none 
                 cursor-ns-resize bg-black rounded-xl p-4 shadow-xl 
                 hover:scale-105 transition"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {hr}
    </div>
  );
};

export default HrDisplay;
