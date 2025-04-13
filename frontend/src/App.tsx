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

  const handleSysBpChange = (newSys: number) => {
    if (newSys === sysBp) {
      console.log("🟡 変化なし：handler呼び出し回避");
      return;
    }
  
    console.log('handleSysBpChange', newSys, sysBp);
    setSysBp(newSys); // ← sysBp 更新
    const next = Math.round(diaBpRef.current + (newSys - sysBp) / 2);
    setDiaBp(next);
  };

  const waveBuffersRef = useRef<Record<BufferKey, WaveBuffer>>({
    ecg: new WaveBuffer({ size: 2000 }),
    spo2: new WaveBuffer({ size: 2000 }),
  });

  const engineRef = useRef<RhythmEngine | null>(null);
  const { stepMs } = ECG_CONFIG;

  const sysBpRef = useRef(sysBp);
  const diaBpRef = useRef(diaBp);

  useEffect(() => {
    diaBpRef.current = diaBp;
  }, [diaBp]);

  useEffect(() => {
    sysBpRef.current = sysBp;
  }, [sysBp]);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-screen-xl mx-auto grid grid-cols-2 gap-3 lg:grid-cols-6">
        {/* タイトル */}
        <div className="col-span-2 md:col-span-4 lg:col-span-6 text-left text-white text-lg font-semibold mb-1">
          PULSEDOM SIMULATOR
        </div>

        {/* ECG波形 */}
        <div className="col-span-2 md:col-span-4 lg:col-span-4 order-1 lg:order-1">
          <ECGCanvas hr={hr} bufferRef={{ current: waveBuffersRef.current['ecg'] }} />
        </div>

        {/* HR数値 */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 order-3 lg:order-2">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-green-500 text-lg">HR</span>
          </div>
          <VitalDisplay param={HR_PARAM} value={hr} setValue={(v) => {
            setHr(v);
            engineRef.current?.setHr(v);
          }} />
        </div>

        {/* SpO2波形 */}
        <div className="col-span-2 md:col-span-4 lg:col-span-4 order-2 lg:order-3">
          <SPO2Canvas hr={hr} bufferRef={{ current: waveBuffersRef.current['spo2'] }} />
        </div>

        {/* SpO2数値 */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 order-4 lg:order-4">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-cyan-400 text-lg">SpO₂</span>
          </div>
          <VitalDisplay param={SPO2_PARAM} value={spo2} setValue={setSpo2} />
        </div>

        {/* ARTラベル（空行） */}
        <div className="col-span-2 md:col-span-4 lg:col-span-4 order-5 lg:order-5 text-sm text-left opacity-60">
          ART
        </div>

        {/* NIBP */}
        <div className="col-span-2 order-6 md:order-4 md:col-span-2  lg:col-span-2 lg:order-6">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-orange-500 text-lg">NIBP</span>
          </div>
          <div className="flex items-baseline space-x-2 w-full justify-between bg-black rounded-2xl ">
            <VitalDisplay param={NIBP_SYS_PARAM} value={sysBp} setValue={handleSysBpChange} />
            <span className="text-orange-400 text-4xl font-bold">/</span>
            <VitalDisplay param={NIBP_DIA_PARAM} value={diaBp} setValue={setDiaBp} />
            <span className="text-yellow-400 text-xl font-medium">
              ({Math.round(sysBp * 1 / 3 + diaBp * 2 / 3)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
