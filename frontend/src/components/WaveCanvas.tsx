// src/components/WaveCanvas.tsx

import React, { useEffect, useRef, useState } from 'react';
import { PX_SCALE } from '../constants/constants';
import { waveMetaMap, WaveMeta } from '../constants/waveMetaMap';
import { leadVectors } from '../constants/leadVectors';

interface WaveCanvasProps {
  bufferRef: React.MutableRefObject<Record<string, { getArray: () => number[]; size: () => number }>>;
  signalKey: string;
  label?: string;
}

// ECGリード用 1mVスケール表示
function drawECGScale(ctx: CanvasRenderingContext2D, size: { width: number, height: number }, gain: number) {
  // 1mVスケール
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

  // スケールラベル
  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.fillText('1 mV', scaleX + 15, scaleTop + 5);
}

const WaveCanvas: React.FC<WaveCanvasProps> = ({ bufferRef, signalKey }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      const buffer = bufferRef.current[signalKey]?.getArray?.() ?? [];
      const visibleSec = size.width / PX_SCALE.pxPerSec;
      const visibleSamples = Math.floor(visibleSec * 1000 / 5); // STEP_MS = 5ms
      const wave = buffer.slice(-visibleSamples);

      ctx.clearRect(0, 0, size.width, size.height);

      // --- 背景: scaleLines(基準線)を描画 ---
      let useNormalizedY = typeof yMax === "number" && typeof yMin === "number";
      if (useNormalizedY && scaleLines.length > 0) {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        // Y座標変換（正規化）
        const yBase = (v: number) =>
          size.height - ((v - yMin!) / (yMax! - yMin!)) * size.height;
        scaleLines.forEach(v => {
          if (v < yMin! || v > yMax!) return;
          const y = yBase(v);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(size.width, y);
          ctx.stroke();
          // ラベル
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

      // --- 波形本体 ---
      if (useNormalizedY) {
        // max/min両方定義あり: 正規化y座標
        const yBase = (v: number) =>
          size.height - ((v - yMin!) / (yMax! - yMin!)) * size.height;

        for (let i = 0; i < wave.length; i++) {
          const timeOffsetSec = (wave.length - i) * 5 / 1000;
          const x1 = size.width - timeOffsetSec * PX_SCALE.pxPerSec;
          const y1 = yBase(wave[i]);
          i === 0 ? ctx.moveTo(x1, y1) : ctx.lineTo(x1, y1);
        }
      } else {
        // 従来通り: baselineRatio, gain
        const baseline = size.height * baselineRatio;
        for (let i = 0; i < wave.length; i++) {
          const timeOffsetSec = (wave.length - i) * 5 / 1000;
          const x1 = size.width - timeOffsetSec * PX_SCALE.pxPerSec;
          const y1 = baseline - wave[i] * gain;
          i === 0 ? ctx.moveTo(x1, y1) : ctx.lineTo(x1, y1);
        }
      }
      ctx.stroke();

      // ECGリードなら従来の1mVスケール
      const isECGLead = (signalKey: string): boolean => signalKey in leadVectors;
      if (isECGLead(signalKey)) {
        drawECGScale(ctx, size, gain);
      }

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
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
