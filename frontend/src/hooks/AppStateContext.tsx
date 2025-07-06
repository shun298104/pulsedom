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
import { BreathEngine } from '../engine/BreathEngine';
import { nanoid } from 'nanoid';
import { useCasesSync } from './useCasesSync';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import isEqual from 'lodash.isequal';
import { PULSEDOM_VERSION } from '../constants/version';

interface AppStateContextProps {
  isCaseReady: boolean;
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
  shareCase: () => Promise<void>;
  mode: "demo" | "server" | "edit" | "view";
  setMode: React.Dispatch<React.SetStateAction<"demo" | "server" | "edit" | "view">>;
  remoteBuffer: WaveBufferMap | null;
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const params = new URLSearchParams(window.location.search);
  const caseId = params.get("case") || "demo";
  const isDemo = caseId === "demo";

  const [simOptions, setSimOptions] = useState<SimOptions>(() => {
    const encoded = params.get("sim");
    const restored = encoded ? decodeSimOptionsFromURL(encoded) : null;
    return restored ?? new SimOptions(createDefaultSimOptions());
  });
  const simOptionsRef = useRef(simOptions);
  useEffect(() => { simOptionsRef.current = simOptions; }, [simOptions]);

  const [hr, setHr] = useState(-1);
  const [isEditorVisible, setEditorVisible] = useState(true);
  const graphRef = useRef<GraphEngine | null>(null);

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
  // クライアント用Firestore受信buffer
  const [remoteBuffer, setRemoteBuffer] = useState<WaveBufferMap | null>(null);

  const breathEngineRef = useRef<BreathEngine>(
    new BreathEngine({
      respRate: simOptions.respRate ?? 12,
      etco2: simOptions.etco2 ?? 38,
    })
  );

  const [mode, setMode] = useState<"demo" | "server" | "edit" | "view">(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("mode");
    if (m === "demo" || m === "server" || m === "edit" || m === "view") return m;
    return "demo";
  });

  // RhythmEngineはserverモードまたはdemo時に生成
  const [engine, setEngine] = useState<RhythmEngine | null>(null);
  const [isCaseReady, setCaseReady] = useState(isDemo);

  useEffect(() => {
    const graph = graphRef.current ?? (graphRef.current = GraphEngine.createDefaultEngine());
    updateGraphEngineFromSim(simOptions, graph);
  }, [isCaseReady]);

  // --- RhythmEngine起動（serverモード or demo時は必ず起動） ---
  useEffect(() => {
    if (!isCaseReady) return;
    if (!isDemo && mode !== "server") {
      setEngine(null);
      return;
    }
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
      if (isSimRunningRef.current) { rhythmEngine.step(now / 1000); }
      animationId = requestAnimationFrame(loop);
    };
    console.log(`🚀 PULSEDOM Version: ${PULSEDOM_VERSION}`);
    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, [isCaseReady, mode, isDemo]); // isDemo依存追加

  // --- buffer Firestore同期：useCasesSyncにmodeを渡して責務分離 ---
  const { updateRemoteCases } = useCasesSync(
    caseId,
    (options: SimOptions) => {
      // SimOptions受信時のロギングと差分判定
      console.log("[onSnapshot] Firestore simOptions received", options.getRaw(), "at", Date.now());
      if (isEqual(options.getRaw(), simOptionsRef.current.getRaw())) {
        console.log("[onSnapshot] skip setSimOptions (no diff)");
        return;
      }
      setSimOptions(options);
      setCaseReady(true);
    },
    bufferRef,
    (bufferObj) => {
      // bufferObj: Record<string, number[]>
      console.log("[onSnapshot] Firestore buffer received", bufferObj);
      setRemoteBuffer(WaveBuffer.fromBufferMap(bufferObj));
    }
  );

  const pushBufferToFirestore = async () => {
    if (!isSimRunningRef.current) { return; }
    if (!caseId || !bufferRef.current) return;
    const ref = doc(db, "cases", caseId);
    const bufferObj: any = {};
    for (const [key, buf] of Object.entries(bufferRef.current)) {
      bufferObj[key] = buf.toArray();
    }
    await updateDoc(ref, {
      buffer: bufferObj,
    });
  };

  useEffect(() => {
    if (isDemo) return; // demo時はFirestoreにpushしない
    if (mode !== "server") return;
    const interval = setInterval(() => {
//      pushBufferToFirestore();
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, caseId, isDemo]);

  const resetSimOptions = () => {
    const resetOptions = new SimOptions(createDefaultSimOptions());
    updateSimOptions(resetOptions);
  };

  const updateSimOptions = (next: SimOptions) => {
    console.log("[updateSimOptions] called", next.getRaw());
    if (isEqual(next.getRaw(), simOptionsRef.current.getRaw())) return;

    const bp_diff = next.sysBp - simOptionsRef.current.sysBp;
    if (bp_diff !== 0) next.diaBp = simOptionsRef.current.diaBp + (bp_diff / 3 * 2);

    if (next.diaBp < 0) next.diaBp = 0;
    if (next.diaBp > next.sysBp) next.diaBp = next.sysBp;

    setSimOptions(next);
    simOptionsRef.current = next;

    const graph = graphRef.current;
    if (graph) { updateGraphEngineFromSim(next, graph); }

    if (!isDemo && updateRemoteCases) {
      console.log("[updateSimOptions] updateRemoteCases writing to Firestore:", next.getRaw());
      updateRemoteCases(next);
    }
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
        setIsSimRunning(false);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const shareCase = async () => {
    console.log("[Sharecase]", isDemo, caseId, simOptions.getRaw());
    if (isDemo) {
      const newCaseId = nanoid(6);
      const ref = doc(db, "cases", newCaseId);
      console.log("[Sharecase] New case created (before setDoc):", newCaseId);
      try {
        await setDoc(ref, {
          ...simOptions.getRaw(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 6),
        });
        console.log("[Sharecase] setDoc success:", newCaseId);
        window.location.search = `?case=${newCaseId}&mode=server`;
      } catch (e) {
        console.log("[Sharecase] setDoc error:", e);
      }
    } else {
      window.alert(`Case shared!\nURL: ${window.location.origin}/pulsedom/?case=${caseId}&mode=server`);
    }
  };

  const value: AppStateContextProps = {
    isCaseReady,
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
    resetSimOptions,
    shareCase,
    mode,
    setMode,
    remoteBuffer,
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
