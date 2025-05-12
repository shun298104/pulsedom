// src/App.tsx
import { useEffect, useRef, useState } from 'react';
import { RhythmEngine } from './engine/RhythmEngine';
import { GraphEngine } from './engine/GraphEngine';
import { unlockAudio } from './audio/unlockAudio';
import { createDefaultSimOptions } from './types/SimOptions';
import { WaveBuffer, WaveBufferMap } from './engine/WaveBuffer';
import { SimOptions } from './types/SimOptions';
import AppUILayout from './components/AppUILayout';
import { leadVectors } from './constants/leadVectors';

function App() {
  const [simOptions, setSimOptions] = useState<SimOptions>(
    new SimOptions(createDefaultSimOptions())
  );
  const simOptionsRef = useRef(simOptions);
  const graphRef = useRef<GraphEngine | null>(null);

  const [hr, setHr] = useState(-1);
  const [spo2, setSpo2] = useState(-1);
  const [sysBp, setSysBp] = useState(120);
  const [diaBp, setDiaBp] = useState(80);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [isBeepOn, setIsBeepOn] = useState(false);
  const [isEditorVisible, setEditorVisible] = useState(true);
  const isBeepOnRef = useRef(false);

  const bufferKeys = [
    ...Object.keys(leadVectors),  // I, II, III, aVR, aVL, aVF, V1〜V6
    'spo2',
    'pulse',
    'art'
  ] as const;
  // バッファの初期化
  const bufferRef = useRef<WaveBufferMap>(
    Object.fromEntries(bufferKeys.map(key => [key, new WaveBuffer()]))
  );

  const sysBpRef = useRef(sysBp);
  const diaBpRef = useRef(diaBp);
  const [engine, setEngine] = useState<RhythmEngine | null>(null);

  useEffect(() => {
    setSpo2(simOptions.spo2);
  }, [simOptions.spo2]);

  useEffect(() => {
    setSysBp(simOptions.sysBp);
  }, [simOptions.sysBp]);

  useEffect(() => {
    setDiaBp(simOptions.diaBp);
  }, [simOptions.diaBp]);

  // 初回レンダー時にインスタンスを生成
  useEffect(() => {
    if (!graphRef.current) { graphRef.current = GraphEngine.createDefaultEngine(); }
  }, []);

  useEffect(() => {

    const rhythmEngine = new RhythmEngine({
      simOptions: simOptionsRef.current,
      graph: graphRef.current as GraphEngine,
      audioCtx,
      isBeepOnRef,
      bufferRef,
    });
    setEngine(rhythmEngine);

    rhythmEngine.setOnHrUpdate(setHr);
    rhythmEngine.setOnSpo2Update(setSpo2);

    if (graphRef.current) graphRef.current.setDebugLevel(0, 5_000);

    let animationId: number;
    const loop = (now: number) => {
      rhythmEngine.step(now / 1000);
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleSimOptionsChange = (next: SimOptions) => {
    //    console.log('[handler sim =]', next)
    setSimOptions(next);                   // Reactに渡す（非同期で再レンダー）UI描画用
    simOptionsRef.current = next;          /// 即時参照用として保持（同期で使用OK）
    graphRef.current?.updateFromSim(next); // グラフエンジンに渡す（即時反映）
  };

  const handleBeepToggle = () => {
    const next = !isBeepOn;
    if (next && !audioCtx) {
      const ctx = unlockAudio();
      setAudioCtx(ctx);
      engine?.setAudioContext(ctx);
    }
    isBeepOnRef.current = next;
    setIsBeepOn(next);
  };

  useEffect(() => {
    sysBpRef.current = sysBp;
  }, [sysBp]);

  useEffect(() => {
    diaBpRef.current = diaBp;
  }, [diaBp]);

  return (
    <AppUILayout
      bufferRef={bufferRef}
      hr={hr}
      spo2={spo2}
      sysBp={sysBp}
      diaBp={diaBp}
      setSysBp={setSysBp}
      setDiaBp={setDiaBp}
      isEditorVisible={isEditorVisible}
      setEditorVisible={setEditorVisible}
      handleSimOptionsChange={handleSimOptionsChange}
      isBeepOn={isBeepOn}
      handleBeepToggle={handleBeepToggle}
      simOptions={simOptions}
    />
  );
}

export default App;
