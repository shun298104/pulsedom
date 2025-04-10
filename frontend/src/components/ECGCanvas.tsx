// src/components/ECGCanvas.tsx
import React, { useEffect, useRef } from 'react';

interface ECGCanvasProps {
  hr: number;
  bufferRef: React.MutableRefObject<{ getArray: () => number[] } | null>;
  stepMs?: number;
  drawPoints?: number;
}

const ECGCanvas: React.FC<ECGCanvasProps> = ({ hr, bufferRef, stepMs = 20, drawPoints = 5 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const xPointerRef = useRef(0);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bufferRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const baseline = height / 2;
    const gain = height * 0.4;

    let animationId: number;
    let lastDrawTime = performance.now();

    const draw = (time: number) => {
      const delta = time - lastDrawTime;
      if (delta >= stepMs) {
        lastDrawTime = time;

        const wave = bufferRef.current?.getArray() ?? [];
        const latestSamples = wave.slice(-drawPoints);

        for (let i = 0; i < latestSamples.length; i++) {
          const x = (xPointerRef.current + i) % width;
          const y = baseline - latestSamples[i] * gain;
          console.log(i, latestSamples[i]);

          ctx.clearRect(x, 0, 1, height);

          const prev = i === 0 ? lastPointRef.current : {
            x: (x - 1 + width) % width,
            y: baseline - latestSamples[i - 1] * gain
          };

          ctx.beginPath();
          if (!prev || Math.abs(prev.y - y) > height) {
            ctx.moveTo(x, y);
          } else {
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(x, y);
          }
          ctx.strokeStyle = 'lime';
          ctx.lineWidth = 2;
          if(x !== 0 ){ctx.stroke();}

          lastPointRef.current = { x, y };
        }

        xPointerRef.current = (xPointerRef.current + latestSamples.length) % width;
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [bufferRef, hr, stepMs, drawPoints]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={150}
      className="border border-green-500 bg-black"
    />
  );
};

export default ECGCanvas;
