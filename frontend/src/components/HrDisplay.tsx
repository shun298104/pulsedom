import React, { useRef, useState } from 'react';

interface HrDisplayProps {
  hr: number;
  setHr: (value: number) => void;
}

const HrDisplay: React.FC<HrDisplayProps> = ({ hr, setHr }) => {
  const startYRef = useRef<number | null>(null);
  const tempHrRef = useRef<number>(hr); // ← 変更候補を保持

  const [localHr, setLocalHr] = useState<number>(hr); // 表示用

  const handlePointerDown = (e: React.PointerEvent) => {
    startYRef.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startYRef.current !== null) {
      const deltaY = startYRef.current - e.clientY;
      const deltaHr = Math.floor(deltaY / 5);
      const newHr = Math.min(180, Math.max(30, hr + deltaHr));
      tempHrRef.current = newHr;
      setLocalHr(newHr); // ← 表示は即反映
    }
  };

  const handlePointerUp = () => {
    startYRef.current = null;
    if (tempHrRef.current !== hr) {
      setHr(tempHrRef.current); // ← ここで初めて反映🔥
    }
  };

  return (
    <div
      className="text-green-300 text-6xl font-bold select-none 
                 cursor-ns-resize bg-black rounded-xl p-4 shadow-xl 
                 hover:scale-105 transition duration-150 ease-out"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp} // ← 念のため
    >
      {localHr}
    </div>
  );
};

export default HrDisplay;
