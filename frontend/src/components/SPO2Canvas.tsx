import { useEffect, useRef } from 'react';
import React from 'react';

interface SPO2CanvasProps {
  spo2: number;
  hr: number;
}

function SPO2Canvas({ spo2, hr }: SPO2CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offsetRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const scrollSpeed = 60; // px/sec 固定

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;
    const amp = 30; // 振幅
    const freq = hr / 60; // 周期（Hz）：1拍/秒 × HR[拍/分] / 60

    lastFrameTimeRef.current = performance.now();

    const draw = (now: number) => {
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      // 背景リセット
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);

      // 波形描画
      ctx.beginPath();
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;

      const timeOffset = offsetRef.current;
      for (let x = 0; x < width; x++) {
        const t = (x + timeOffset) / 1000; // t[秒]
        const y = midY - amp * Math.sin(2 * Math.PI * freq * t);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();

      offsetRef.current = (offsetRef.current + scrollSpeed * (delta / 1000)) % 1000;

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
  }, [hr]);

  return <canvas ref={canvasRef} width={800} height={100} className="bg-black border border-cyan-500" />;
}

export default SPO2Canvas;
