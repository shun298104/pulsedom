// src/App.tsx

import React, { useEffect, useRef, useState } from 'react';
import ECGCanvas from './components/ECGCanvas';
import SPO2Canvas from './components/SPO2Canvas';
import { ECGBuffer } from './engine/ECGBuffer';
import { RhythmEngine } from './engine/RhythmEngine';
import HrDisplay from './components/HrDisplay'; // ←追加！

function App() {
  // 心拍数とSpO2の表示用ステート（画面右側の数値表示）
  const [hr, setHr] = useState(80);
  const [spo2, setSpo2] = useState(100);

  // ECGバッファとリズムエンジンの参照保持（useRefにより永続的に保持）
  const bufferRef = useRef<ECGBuffer | null>(null);
  const engineRef = useRef<RhythmEngine | null>(null);

  // ECG波形データの状態。Canvas側に渡すことで描画に使用
  const [wave, setWave] = useState<number[]>([]); // ← new!

  // 初期化処理と定期的な波形更新（心拍ごとに10ms刻み）
  useEffect(() => {
    // バッファの初期化（波形の履歴を保持）
    const buffer = new ECGBuffer({ size: 2000 });

    // リズムエンジン初期化（心拍数・ステップ幅指定）
    const engine = new RhythmEngine({ buffer, hr, stepMs: 10 });

    // 参照に格納して、後続の操作でも使えるようにする
    bufferRef.current = buffer;
    engineRef.current = engine;

    console.log('[App] wave.length =', buffer.getArray().length); // 初期バッファ長の確認

    // 10msごとにエンジンを進めて波形を更新するタイマー処理
    const interval = setInterval(() => {
      engine.step(10); // 心電図を1ステップ進める（10ms単位）

      // バッファから現在の波形を取り出してステートに反映（描画トリガー）
      setWave([...buffer.getArray()]); // ← wave更新！
    }, 10);

    // クリーンアップ（再マウント時やunmount時にタイマー停止）
    return () => clearInterval(interval);
  }, [hr]); // 心拍数が変化したときだけ再生成される

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex flex-col md:flex-row items-start justify-center md:items-center">
        {/* 左側：波形表示領域 */}
        <div className="mb-4 md:mr-8 md:mb-0">
          {/* ECG波形Canvas：心拍数と波形データをPropsで受け取る */}
          <ECGCanvas hr={hr} wave={wave} />

          {/* SpO2波形Canvas：SpO2値と心拍数をPropsで渡す */}
          <div className="mt-4">
            <SPO2Canvas spo2={spo2} hr={hr} />
          </div>
        </div>

        {/* 右側：HRとSpO2の数値表示（実数値） */}
        <div className="flex flex-col space-y-6">
          {/* HR表示 */}
// 省略...

{/* HR表示（ドラッグ式） */}
<div>
  <div className="flex items-center space-x-2">
    <span className="text-green-400 text-lg">HR</span>
  </div>
  <HrDisplay hr={hr} setHr={setHr} />
</div>

          {/* SpO2表示 */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-cyan-400 text-lg">SpO2</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-cyan-300 text-6xl font-bold">
                {spo2}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
