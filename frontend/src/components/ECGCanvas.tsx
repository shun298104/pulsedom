// src/components/ECGCanvas.tsx
import React, { useEffect, useRef } from 'react';

interface ECGCanvasProps {
  hr: number;
  wave: number[];
}

function ECGCanvas({ hr, wave }: ECGCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveRef = useRef<number[]>([]);
  const pointerRef = useRef<number>(0); // ← 現在描画しているx位置
  const lastYRef = useRef<number | null>(null); // ← 直前のY座標を保持

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

    // 背景初期化
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    const draw = () => {
      const wave = waveRef.current;
      const x = pointerRef.current;
      const y = midY - (wave[wave.length - 1] || 0) * scaleY;
    
      // 背景：描画中の縦ラインだけクリア
      ctx.clearRect(x, 0, 2, height);
    
      // ← 巻き戻し検知（左端に戻った瞬間は線を引かない）
      const isWrapAround = x === 0;
    
      if (lastYRef.current !== null && !isWrapAround) {
        ctx.beginPath();
        ctx.moveTo((x - 1 + width) % width, lastYRef.current!);
        ctx.lineTo(x, y);
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    
      lastYRef.current = y;
      pointerRef.current = (x + 1) % width;
    
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);

    return () => {
      // クリーンアップ
    };
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
