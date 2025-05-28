// src/App.tsx
import { useEffect, useRef, useState } from 'react';
import { RhythmEngine } from './engine/RhythmEngine';
import { GraphEngine } from './engine/GraphEngine';
import { unlockAudio } from './audio/unlockAudio';
import { createDefaultSimOptions } from './types/SimOptions';
import { WaveBuffer, WaveBufferMap } from './engine/WaveBuffer';
import { SimOptions } from './types/SimOptions';
import { leadVectors } from './constants/leadVectors';
import { updateGraphEngineFromSim } from './engine/GraphControl'
import { decodeSimOptionsFromURL } from './utils/simOptionsURL';
import { useAlarmSound } from './hooks/useAlarmSound';
import { stopAlarm } from './lib/AlarmAudioController'
import AppUILayout from './components/AppUILayout';
import * as Tooltip from '@radix-ui/react-tooltip';

function App() {
  //simoptionの初期化
  const [simOptions, setSimOptions] = useState<SimOptions>(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("sim");
    const restored = encoded ? decodeSimOptionsFromURL(encoded) : null;
    return restored ?? new SimOptions(createDefaultSimOptions());
  });

  const simOptionsRef = useRef(simOptions);
  const graphRef = useRef<GraphEngine | null>(null);
  const [hr, setHr] = useState(-1);

  //同期音関連
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [isBeepOn, setIsBeepOn] = useState(false);
  const [isEditorVisible, setEditorVisible] = useState(true);
  const isBeepOnRef = useRef(false);

  //アラームコントロール
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const { alarmLevel, alarmMessages } = useAlarmSound(simOptions, hr, alarmAudioRef);
const handleStopAlarm = () => stopAlarm(alarmAudioRef.current, alarmLevel);

  // バッファの初期化
  const bufferKeys = [
    ...Object.keys(leadVectors),  // I, II, III, aVR, aVL, aVF, V1〜V6
    'spo2',
    'pulse',
    'art'
  ] as const;
  const bufferRef = useRef<WaveBufferMap>(
    Object.fromEntries(bufferKeys.map(key => [key, new WaveBuffer()]))
  );

  // 初回レンダー時にインスタンスを生成
  const [engine, setEngine] = useState<RhythmEngine | null>(null);
  useEffect(() => {
    const graph = graphRef.current ?? (graphRef.current = GraphEngine.createDefaultEngine());
    updateGraphEngineFromSim(simOptions, graph);
  }, []);

  useEffect(() => {

    const rhythmEngine = new RhythmEngine({
      graph: graphRef.current as GraphEngine,
      bufferRef,
      audioCtx,
      isBeepOn: () => isBeepOnRef.current,
      getVitals: () => {
        const raw = simOptionsRef.current.getRaw();
        return {
          spo2: Number(raw.spo2 ?? -1),
          nibp_sys: Number(raw.nibp_sys ?? 120),
          nibp_dia: Number(raw.nibp_dia ?? 70),
        };
      },
      onHrUpdate: setHr,
    });
    setEngine(rhythmEngine);

    rhythmEngine.setOnHrUpdate(setHr);

    if (graphRef.current) graphRef.current.setDebugLevel(2, 5_000);

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
    const graph = graphRef.current;
    if (graph) updateGraphEngineFromSim(next, graph);
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
    <Tooltip.Provider>
      <AppUILayout
        bufferRef={bufferRef}
        alarmAudioRef={alarmAudioRef}
        hr={hr}
        isEditorVisible={isEditorVisible}
        setEditorVisible={setEditorVisible}
        handleSimOptionsChange={handleSimOptionsChange}
        isBeepOn={isBeepOn}
        handleBeepToggle={handleBeepToggle}
        simOptions={simOptions}
        stopAlarm={handleStopAlarm}
        alarmLevel={alarmLevel}
        alarmMessages={alarmMessages}
      />
    </Tooltip.Provider>
  );
}

export default App;
