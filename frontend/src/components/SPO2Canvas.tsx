// src/components/SPO2Canvas.tsx
import React, { useEffect, useRef } from 'react';
import { WaveBuffer } from '../engine/WaveBuffer';

interface SPO2CanvasProps {
  hr: number;
  bufferRef: React.MutableRefObject<{ getArray: () => number[] } | null>;
}

const SPO2Canvas: React.FC<SPO2CanvasProps> = ({ hr, bufferRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<number>(0);
  const lastYRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const baseline = height / 2;
    const gain = height * 0.4;

    const draw = () => {
      const wave = bufferRef.current?.getArray() ?? [];
      const from = pointerRef.current;
      const to = wave.length;
      const newPoints = wave.slice(from, to);

      ctx.strokeStyle = '#00FFFF'; // cyan
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let i = 0; i < newPoints.length; i++) {
        const x = (from + i) % width;
        const y = baseline - newPoints[i] * gain;

        if (lastYRef.current === null || x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        lastYRef.current = y;
      }

      ctx.stroke();
      pointerRef.current = to;
      requestAnimationFrame(draw);
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pointerRef.current = 0;
    lastYRef.current = null;

    requestAnimationFrame(draw);
  }, [bufferRef]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={100}
      className="border border-cyan-400 bg-gray-900"
    />
  );
};

export default SPO2Canvas;
