import React, { useEffect, useRef } from 'react';

interface ECGCanvasProps {
  hr: number;
  wave: number[];
}

function ECGCanvas({ hr, wave }: ECGCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveRef = useRef<number[]>([]); // ← 最新waveをRefで保持

  // wave更新のたびにRefを書き換え（再描画トリガーにはしない）
  useEffect(() => {
    waveRef.current = wave;
  }, [wave]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
  
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;
    const scaleY = 40;
  
    let animationFrameId: number;
  
    const draw = () => {
      const wave = waveRef.current;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);
  
      ctx.beginPath();
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
  
      const start = Math.max(0, wave.length - width); // ← ここ安全に
      for (let x = 0; x < width; x++) {
        const i = start + x;
        const y = midY - (wave[i] || 0) * scaleY;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
  
      ctx.stroke();
      animationFrameId = requestAnimationFrame(draw);
    };
  
    animationFrameId = requestAnimationFrame(draw); // ← ループスタート忘れず！
  
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={150}
      className="bg-black border border-green-500"
    />
  );
}

export default ECGCanvas;
