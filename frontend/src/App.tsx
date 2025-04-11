// src/App.tsx
import React, { useEffect, useRef, useState } from 'react';
import ECGCanvas from './components/ECGCanvas';
import SPO2Canvas from './components/SPO2Canvas';
import { WaveBuffer } from './engine/WaveBuffer';
import { RhythmEngine } from './engine/RhythmEngine';
import VitalDisplay from './components/VitalDisplay';
import { ECG_CONFIG } from './constants';
import {
  HR_PARAM,
  SPO2_PARAM,
  NIBP_SYS_PARAM,
  NIBP_DIA_PARAM,
} from './models/VitalParameter';

const BUFFER_NAMES = ['ecg', 'spo2'] as const;
type BufferKey = typeof BUFFER_NAMES[number];

function App() {
  const [hr, setHr] = useState(60);
  const [spo2, setSpo2] = useState(100);
  const [sysBp, setSysBp] = useState(120);
  const [diaBp, setDiaBp] = useState(70);

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

  const handleSysBpChange = (newSys: number) => {
    const newDia = Math.round(newSys * 2 / 3);
    setSysBp(newSys);
    setDiaBp(newDia);
  };

  useEffect(() => {
    engineRef.current = new RhythmEngine({
      buffers: waveBuffersRef.current,
      hr,
    });
    const interval = setInterval(() => {
      engineRef.current?.step(stepMs);
    }, stepMs);
    return () => clearInterval(interval);
  }, []);

  const map = Math.round(diaBp + (sysBp - diaBp) / 3);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 m-auto">
      <div className="container grid gap-1 grid-cols-2 md:grid-cols-4 lg:grid-cols-6" >
        <div className="grid-item col-span-4 order-1">
          <ECGCanvas hr={hr} bufferRef={{ current: waveBuffersRef.current['ecg'] }} />
        </div>
        <div className="grid-item col-span-1 order-3 md:order-3 lg:order-2">
        <div className="flex items-center space-x-2 mb-3">
              <span className="text-green-400 text-lg">HR</span>
            </div>
            <VitalDisplay param={HR_PARAM} value={hr} setValue={handleHrChange} />
        </div>
        <div className="grid-item col-span-4  order-2 md:order-2 lg:order-3">
          <SPO2Canvas hr={hr} bufferRef={{ current: waveBuffersRef.current['spo2'] }} /></div>
        <div className="grid-item col-span-1 order-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-cyan-400 text-lg">SpO₂</span>
          </div>
          <VitalDisplay param={SPO2_PARAM} value={spo2} setValue={setSpo2} />
        </div>
        <div className="grid-item col-span-4 order-6 invisible md:order-6 lg:order-5 lg:visible">
          ART
        </div>
        <div className="grid-item col-span-2 order-5 md:order-5 lg:order-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-orange-400 text-lg">NIBP</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <VitalDisplay param={NIBP_SYS_PARAM} value={sysBp} setValue={handleSysBpChange} />
            <span className="text-4xl font-bold text-orange-400">/</span>
            <VitalDisplay param={NIBP_DIA_PARAM} value={diaBp} setValue={setDiaBp} />
            <span className="text-orange-400 text-4xl mt-1 opacity-80 font-bold">({map})</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
