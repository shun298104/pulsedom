import React, { useEffect, useRef, useState } from 'react';
import { PX_SCALE } from '../constants/constants';
import { waveMetaMap, WaveMeta } from '../constants/waveMetaMap';
import { leadVectors } from '../constants/leadVectors';

interface WaveCanvasProps {
  bufferRef: React.MutableRefObject<Record<string, { getArray: () => number[]; size: () => number }>>;
  signalKey: string;
  label?: string;
}

function drawECGScale(ctx: CanvasRenderingContext2D, size: { width: number, height: number }, gain: number) {
  const scaleX = 10;
  const scaleHeight = gain * 1;
  const scaleTop = size.height / 2 - scaleHeight / 2;
  const scaleBottom = size.height / 2 + scaleHeight / 2;

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(scaleX, scaleBottom);
  ctx.lineTo(scaleX, scaleTop);
  ctx.lineTo(scaleX + 10, scaleTop);
  ctx.moveTo(scaleX, scaleBottom);
  ctx.lineTo(scaleX + 10, scaleBottom);
  ctx.stroke();

  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.fillText('1 mV', scaleX + 15, scaleTop + 5);
}

const WaveCanvas: React.FC<WaveCanvasProps> = ({ bufferRef, signalKey }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const meta: WaveMeta = waveMetaMap[signalKey];
  const gain = meta?.gain ?? PX_SCALE.pxPerMv;
  const baselineRatio = meta?.baselineRatio ?? 0.66;
  const strokeStyle = meta?.color ?? '#4ade80';
  const labelText = meta?.label ?? signalKey;
  const yMax = meta?.max;
  const yMin = meta?.min;
  const scaleLines = meta?.scaleLines ?? [];

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
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || size.width === 0 || size.height === 0) return;

    const draw = () => {
      const buf = bufferRef.current[signalKey];
      const full = buf?.getArray?.() ?? [];
      const length = buf?.size?.() ?? 0;
      const visibleSec = size.width / PX_SCALE.pxPerSec;
      const visibleSamples = Math.floor(visibleSec * 1000 / 5); // STEP_MS = 5ms
      const start = Math.max(0, length - visibleSamples);
      const step = Math.max(1, Math.floor((length - start) / size.width));

      ctx.clearRect(0, 0, size.width, size.height);

      let useNormalizedY = typeof yMax === "number" && typeof yMin === "number";
      if (useNormalizedY && scaleLines.length > 0) {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        const yBase = (v: number) =>
          size.height - ((v - yMin!) / (yMax! - yMin!)) * size.height;
        scaleLines.forEach(v => {
          if (v < yMin! || v > yMax!) return;
          const y = yBase(v);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(size.width, y);
          ctx.stroke();
          ctx.fillStyle = '#aaa';
          ctx.font = '11px Arial';
          ctx.fillText(`${v}`, 2, y - 2);
        });
        ctx.setLineDash([]);
        ctx.restore();
      }

      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 2.0;
      ctx.beginPath();

      const baseline = size.height * baselineRatio;
      const yBaseNorm = (v: number) =>
        size.height - ((v - yMin!) / (yMax! - yMin!)) * size.height;

      for (let i = start; i < length; i += step) {
        const idx = i % full.length;
        const val = full[idx];
        const timeOffsetSec = (length - i) * 5 / 1000;
        const x1 = size.width - timeOffsetSec * PX_SCALE.pxPerSec;
        const y1 = useNormalizedY ? yBaseNorm(val) : baseline - val * gain;
        i === start ? ctx.moveTo(x1, y1) : ctx.lineTo(x1, y1);
      }
      ctx.stroke();

      const isECGLead = (signalKey: string): boolean => signalKey in leadVectors;
      if (isECGLead(signalKey)) {
        drawECGScale(ctx, size, gain);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size, signalKey, gain, baselineRatio, strokeStyle, yMax, yMin, scaleLines]);

  return (
    <div ref={containerRef} className="w-full h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px] relative">
      <canvas
        ref={canvasRef}
        width={size.width}
        height={size.height}
        className=" bg-gray-900 rounded-md"
      />
      <div className="absolute top-1 left-2 text-sm text-white opacity-80">{labelText}</div>
    </div>
  );
};

export default WaveCanvas;
