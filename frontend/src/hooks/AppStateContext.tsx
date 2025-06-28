// AppStateContext.tsx
import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { RhythmEngine } from '../engine/RhythmEngine';
import { GraphEngine } from '../engine/GraphEngine';
import { unlockAudio } from '../audio/unlockAudio';
import { leadVectors } from '../constants/leadVectors';
import { WaveBuffer, WaveBufferMap } from '../engine/WaveBuffer';
import { createDefaultSimOptions, SimOptions } from '../types/SimOptions';
import { updateGraphEngineFromSim } from '../engine/GraphControl';
import { decodeSimOptionsFromURL } from '../utils/simOptionsURL';
import { useAlarmSound } from '../hooks/useAlarmSound';
import { stopAlarm as stopAlarmLib } from '../lib/AlarmAudioController';
import { PULSEDOM_VERSION } from '../constants/version';
import { BreathEngine } from '../engine/BreathEngine';
import { useSimOptionsSync } from '../hooks/useSimOptionsSync';

interface AppStateContextProps {
  isSimOptionsReady: boolean;
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
  breathEngine: BreathEngine;
  resetSimOptions: () => void;
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("room") || "demo";

  const [simOptions, setSimOptions] = useState<SimOptions>(() => {
    const encoded = params.get("sim");
    const restored = encoded ? decodeSimOptionsFromURL(encoded) : null;
    return restored ?? new SimOptions(createDefaultSimOptions());
  });
  const simOptionsRef = useRef(simOptions);
  useEffect(() => { simOptionsRef.current = simOptions; }, [simOptions]);

  const graphRef = useRef<GraphEngine | null>(null);
  const [hr, setHr] = useState(-1);
  const [isEditorVisible, setEditorVisible] = useState(true);

  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [isBeepOn, setIsBeepOn] = useState(false);
  const isBeepOnRef = useRef(false);
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const isAlarmOnRef = useRef(false);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
  const { alarmLevel, alarmMessages } = useAlarmSound(simOptions, hr, alarmAudioRef, isAlarmOn);
  const stopAlarm = () => stopAlarmLib(alarmAudioRef.current, alarmLevel);

  const bufferKeys = [
    ...Object.keys(leadVectors),
    'spo2', 'art', 'etco2',
  ] as const;
  const bufferRef = useRef<WaveBufferMap>(
    Object.fromEntries(bufferKeys.map(key => [key, new WaveBuffer()]))
  );

  const breathEngineRef = useRef<BreathEngine>(
    new BreathEngine({
      respRate: simOptions.respRate ?? 12,
      etco2: simOptions.etco2 ?? 38,
    })
  );

  const [isSimOptionsReady, setSimOptionsReady] = useState(false);
  const { updateRemoteSimOptions } = useSimOptionsSync(
    roomId,
    (options) => {
      setSimOptions(options);
      setSimOptionsReady(true);
    },
    graphRef,
    breathEngineRef
  );

  const [engine, setEngine] = useState<RhythmEngine | null>(null);
  useEffect(() => {
    const graph = graphRef.current ?? (graphRef.current = GraphEngine.createDefaultEngine());
    updateGraphEngineFromSim(simOptions, graph);
  }, [isSimOptionsReady]);

  useEffect(() => {
    if (!isSimOptionsReady) return;

    breathEngineRef.current.update({
      respRate: simOptions.respRate,
      etco2: simOptions.etco2,
    });

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
          etco2: Number(raw.etco2 ?? 38),
          pi: Number(raw.pi ?? 2),
        };
      },
      onHrUpdate: setHr,
      breathEngine: breathEngineRef.current,
    });

    setEngine(rhythmEngine);
    rhythmEngine.setOnHrUpdate(setHr);

    if (graphRef.current) graphRef.current.setDebugLevel(0, 6000);

    let animationId: number;
    const loop = (now: number) => {
      if (isSimRunningRef.current) {
        rhythmEngine.step(now / 1000, isSimRunningRef.current);
      }
      animationId = requestAnimationFrame(loop);
    };
    console.log(`🚀 PULSEDOM Version: ${PULSEDOM_VERSION} (RE initialized after simOptionsReady)`);
    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, [isSimOptionsReady]);

  const resetSimOptions = () => {
    const resetOptions = new SimOptions(createDefaultSimOptions());
    updateSimOptions(resetOptions);
  };

  /* UPDATE SIMULATION OPTIONS */
  const updateSimOptions = (next: SimOptions) => {
    const bp_diff = next.sysBp - simOptionsRef.current.sysBp;
    if (bp_diff !== 0) next.diaBp = simOptionsRef.current.diaBp + (bp_diff / 3 * 2);

    if (next.diaBp < 0) next.diaBp = 0;
    if (next.diaBp > next.sysBp) next.diaBp = next.sysBp;

    setSimOptions(next);
    simOptionsRef.current = next;

    const graph = graphRef.current;
    if (graph) { updateGraphEngineFromSim(next, graph); }

    updateRemoteSimOptions(next);

    breathEngineRef.current.update({
      respRate: next.respRate,
      etco2: next.etco2,
    });
  };

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

  const isSimRunningRef = useRef(true);
  const [isSimRunning, setIsSimRunning] = useState(true);
  useEffect(() => { isSimRunningRef.current = isSimRunning; }, [isSimRunning]);
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log(bufferRef)
        console.log("[ESC] simulation suspended.")
        setIsSimRunning(false);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const value: AppStateContextProps = {
    isSimOptionsReady,
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
    breathEngine: breathEngineRef.current,
    resetSimOptions
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
};
