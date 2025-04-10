// src/App.tsx
import React, { useEffect, useRef, useState } from 'react';
import ECGCanvas from './components/ECGCanvas';
import SPO2Canvas from './components/SPO2Canvas';
import { WaveBuffer } from './engine/WaveBuffer';
import { RhythmEngine } from './engine/RhythmEngine';
import VitalDisplay from './components/VitalDisplay';
import { ECG_CONFIG } from './constants';
import { HR_PARAM, SPO2_PARAM } from './models/VitalParameter';

// 🔧 バッファ名リスト（ARTなど増やすならここに追加）
const BUFFER_NAMES = ['ecg', 'spo2'] as const;
type BufferKey = typeof BUFFER_NAMES[number];

function App() {
  const [hr, setHr] = useState(60);
  const [spo2, setSpo2] = useState(100);

  // 🧠 バッファとエンジンの参照
  const waveBuffersRef = useRef<Record<BufferKey, WaveBuffer>>({
    ecg: new WaveBuffer({ size: 2000 }),
    spo2: new WaveBuffer({ size: 2000 }),
  });

  const engineRef = useRef<RhythmEngine | null>(null);
  const { stepMs } = ECG_CONFIG;

  const handleHrChange = (newHr: number) => {
    setHr(newHr);
    engineRef.current?.setHr(newHr);
  };

  useEffect(() => {
    // 💓 RhythmEngine に必要なバッファを渡して初期化
    engineRef.current = new RhythmEngine({
      buffers: waveBuffersRef.current, // ← ✅ 正解！これ1個だけ渡す
      hr,
    });
    const interval = setInterval(() => {
      engineRef.current?.step(stepMs);
    }, stepMs);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex flex-col md:flex-row items-start justify-center md:items-center">
        <div className="mb-4 md:mr-8 md:mb-0">
          <ECGCanvas
            hr={hr}
            bufferRef={{ current: waveBuffersRef.current['ecg'] }}
          />
          <div className="mt-4">
            <SPO2Canvas
              hr={hr}
              bufferRef={{ current: waveBuffersRef.current['spo2'] }}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400 text-lg">HR</span>
            </div>
            <VitalDisplay param={HR_PARAM} value={hr} setValue={handleHrChange} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-cyan-400 text-lg">SpO2</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <VitalDisplay param={SPO2_PARAM} value={spo2} setValue={setSpo2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
