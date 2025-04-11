import React, { useEffect, useRef, useState } from 'react';

interface SPO2CanvasProps {
  hr: number;
  bufferRef: React.MutableRefObject<{ getArray: () => number[] } | null>;
}

const SPO2Canvas: React.FC<SPO2CanvasProps> = ({ hr, bufferRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<number>(0);
  const lastYRef = useRef<number | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // ResizeObserverでサイズ監視
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bufferRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || size.width === 0 || size.height === 0) return;

    const baseline = size.height / 2;
    const gain = size.height * 0.4;

    const draw = () => {
      const wave = bufferRef.current?.getArray() ?? [];
      const from = pointerRef.current;
      const to = wave.length;
      const newPoints = wave.slice(from, to);

      ctx.strokeStyle = '#00FFFF'; // cyan
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let i = 0; i < newPoints.length; i++) {
        const x = (from + i) % size.width;
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

    // 初期化
    ctx.clearRect(0, 0, size.width, size.height);
    pointerRef.current = 0;
    lastYRef.current = null;

    requestAnimationFrame(draw);
  }, [bufferRef, hr, size]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px]"
    >
      <canvas
        ref={canvasRef}
        width={size.width}
        height={size.height}
        className="bg-black rounded-xl"
      />
    </div>
  );
};

export default SPO2Canvas;
