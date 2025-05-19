// src/App.tsx
import { useEffect, useRef, useState } from 'react';
import { RhythmEngine } from './engine/RhythmEngine';
import { GraphEngine } from './engine/GraphEngine';
import { unlockAudio } from './audio/unlockAudio';
import { createDefaultSimOptions } from './types/SimOptions';
import { WaveBuffer, WaveBufferMap } from './engine/WaveBuffer';
import { SimOptions } from './types/SimOptions';
import { leadVectors } from './constants/leadVectors';

import AppUILayout from './components/AppUILayout';

function App() {
  const [simOptions, setSimOptions] = useState<SimOptions>(
    new SimOptions(createDefaultSimOptions())
  );
  const simOptionsRef = useRef(simOptions);
  const graphRef = useRef<GraphEngine | null>(null);

  const [hr, setHr] = useState(-1);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [isBeepOn, setIsBeepOn] = useState(false);
  const [isEditorVisible, setEditorVisible] = useState(true);
  const isBeepOnRef = useRef(false);

  const [afOptions, setAfOptions] = useState({ fWaveFreq: 400, fWaveAmp: 0.04, conductProb: 0.3 });
  const [aflOptions, setAflOptions] = useState({ aflFreq: 300, conductRatio: 2 });

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

  const [engine, setEngine] = useState<RhythmEngine | null>(null);

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

    if (graphRef.current) graphRef.current.setDebugLevel(2, 2_000);

    let animationId: number;
    const loop = (now: number) => {
      if (isSimRunningRef.current) {
        rhythmEngine.step(now / 1000, isSimRunningRef.current);
      }
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleSimOptionsChange = (next: SimOptions) => {
    setSimOptions(next);
    simOptionsRef.current = next;
    graphRef.current?.updateFromSim(next);
  };
  const handleCustomOptionsChange = (ruleId: string, nextOptions: any) => {
    console.log("[handleCustomOptionsChange]", ruleId, nextOptions);
    if (ruleId === "Af") setAfOptions(nextOptions);
    if (ruleId === "Afl") setAflOptions(nextOptions);
    graphRef.current?.updateFromCustomOptions(ruleId, nextOptions);
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

  const isSimRunningRef = useRef(true);
  const [isSimRunning, setIsSimRunning] = useState(true);
  useEffect(() => {
    isSimRunningRef.current = isSimRunning;
  }, [isSimRunning]);
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSimRunning(false); 
        console.log('🔚[ESC] Simulation paused');
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);
  return (
    <AppUILayout
      bufferRef={bufferRef}
      hr={hr}
      isEditorVisible={isEditorVisible}
      setEditorVisible={setEditorVisible}
      handleSimOptionsChange={handleSimOptionsChange}
      handleCustomOptionsChange={handleCustomOptionsChange}
      isBeepOn={isBeepOn}
      handleBeepToggle={handleBeepToggle}
      simOptions={simOptions}
      afOptions={afOptions}
      aflOptions={aflOptions}
    />
  );
}

export default App;
