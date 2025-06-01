import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { RhythmEngine } from '../engine/RhythmEngine';
import { GraphEngine } from '../engine/GraphEngine';
import { unlockAudio } from '../audio/unlockAudio';
import { createDefaultSimOptions, SimOptions } from '../types/SimOptions';
import { WaveBuffer, WaveBufferMap } from '../engine/WaveBuffer';
import { leadVectors } from '../constants/leadVectors';
import { updateGraphEngineFromSim } from '../engine/GraphControl';
import { decodeSimOptionsFromURL } from '../utils/simOptionsURL';
import { useAlarmSound } from '../hooks/useAlarmSound';
import { stopAlarm as stopAlarmLib } from '../lib/AlarmAudioController';

// 型定義
interface AppStateContextProps {
  bufferRef: React.RefObject<WaveBufferMap>;
  alarmAudioRef: React.RefObject<HTMLAudioElement | null>;
  hr: number;
  setHr: React.Dispatch<React.SetStateAction<number>>;
  isEditorVisible: boolean;
  setEditorVisible: React.Dispatch<React.SetStateAction<boolean>>;
  simOptions: SimOptions;
  updateSimOptions: (next: SimOptions) => void;
  isBeepOn: boolean;
  isAlarmOn: boolean;
  toggleBeep: () => void;
  toggleAlarm: () => void;
  alarmLevel: string;
  alarmMessages: string[];
  stopAlarm: () => void;
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- SimOptions初期化 ---
  const [simOptions, setSimOptions] = useState<SimOptions>(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("sim");
    const restored = encoded ? decodeSimOptionsFromURL(encoded) : null;
    return restored ?? new SimOptions(createDefaultSimOptions());
  });
  const simOptionsRef = useRef(simOptions);
  useEffect(() => { simOptionsRef.current = simOptions; }, [simOptions]);

  const graphRef = useRef<GraphEngine | null>(null);
  const [hr, setHr] = useState(-1);

  // 同期音関連
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [isBeepOn, setIsBeepOn] = useState(false);
  const isBeepOnRef = useRef(false);
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const isAlarmOnRef = useRef(false);
  const [isEditorVisible, setEditorVisible] = useState(true);

  // アラームコントロール
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const { alarmLevel, alarmMessages } = useAlarmSound(simOptions, hr, alarmAudioRef, isAlarmOn);
  const stopAlarm = () => stopAlarmLib(alarmAudioRef.current, alarmLevel);

  // バッファの初期化
  const bufferKeys = [
    ...Object.keys(leadVectors),
    'spo2',
    'pulse',
    'art'
  ] as const;
  const bufferRef = useRef<WaveBufferMap>(
    Object.fromEntries(bufferKeys.map(key => [key, new WaveBuffer()]))
  );

  // RhythmEngine管理
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

    if (graphRef.current) graphRef.current.setDebugLevel(1, 6_000);

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

  // SimOptions更新
  const updateSimOptions = (next: SimOptions) => {
    setSimOptions(next);
    const bp_diff = next.sysBp - simOptionsRef.current.sysBp;
    if (bp_diff !== 0) {
      next.diaBp = simOptionsRef.current.diaBp + (bp_diff / 3 * 2)
    }
    if (next.diaBp < 0) next.diaBp = 0;
    if (next.diaBp > next.sysBp) next.diaBp = next.sysBp
    simOptionsRef.current = next;
    const graph = graphRef.current;
    if (graph) updateGraphEngineFromSim(next, graph);
  };

  // Beep/Alarm切替
  const toggleBeep = () => {
    const next = !isBeepOn;
    if (next && !audioCtx) {
      const ctx = unlockAudio();
      setAudioCtx(ctx);
      engine?.setAudioContext(ctx);
    }
    isBeepOnRef.current = next;
    setIsBeepOn(next);
  };

  const toggleAlarm = () => {
    const next = !isAlarmOn;
    isAlarmOnRef.current = next;
    setIsAlarmOn(next);
    if (!next) { stopAlarmLib(alarmAudioRef.current, alarmLevel); }
  };

  // シミュレーション一時停止
  const isSimRunningRef = useRef(true);
  const [isSimRunning, setIsSimRunning] = useState(true);
  useEffect(() => { isSimRunningRef.current = isSimRunning; }, [isSimRunning]);
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsSimRunning(false); }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Context提供値
  const value: AppStateContextProps = {
    bufferRef,
    alarmAudioRef,
    hr,
    setHr,
    isEditorVisible,
    setEditorVisible,
    simOptions,
    updateSimOptions,
    isBeepOn,
    isAlarmOn,
    toggleBeep,
    toggleAlarm,
    alarmLevel,
    alarmMessages,
    stopAlarm,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

// カスタムフック
export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
};
