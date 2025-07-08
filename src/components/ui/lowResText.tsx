import React, { useRef, useEffect } from "react";

type LowResTextProps = {
  text: string;
  width?: number;      // キャンバスの幅（ピクセル）
  height?: number;     // キャンバスの高さ
  scale?: number;      // 拡大倍率
  color?: string;      // 文字色
  bgColor?: string;    // 背景色
  fontSize?: number;   // フォントサイズ（キャンバス内ピクセル単位）
  fontFamily?: string; // 任意フォント（デフォルト monospace）
};

const LowResText: React.FC<LowResTextProps> = ({
  text,
  width = 32,
  height = 40,
  scale = 4,
  color = "#0ff",
  bgColor = "#111",
  fontSize = 24,
  fontFamily = "monospace"
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // クリア
    ctx.clearRect(0, 0, width, height);

    // 背景
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // 文字
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(text, width / 2, height / 2 + 2);
  }, [text, width, height, color, bgColor, fontSize, fontFamily]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: width * scale,
        height: height * scale,
        imageRendering: "pixelated",
        display: "block",
        borderRadius: 8,
        boxShadow: "0 0 12px #0ff4"
      }}
    />
  );
};

export default LowResText;
