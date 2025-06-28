// src/hooks/useSimulationRunner.ts
import { useEffect, useState } from 'react';
import { RhythmEngine } from '../engine/RhythmEngine';
import { GraphEngine } from '../engine/GraphEngine';
import { BreathEngine } from '../engine/BreathEngine';
import { updateGraphEngineFromSim } from '../engine/GraphControl';
import { SimOptions } from '../types/SimOptions';
import { WaveBufferMap } from '../engine/WaveBuffer';
import { PULSEDOM_VERSION } from '../constants/version';

export const useSimulationRunner = (
  simOptionsRef: React.RefObject<SimOptions>,
  bufferRef: React.RefObject<WaveBufferMap>,
  breathEngineRef: React.RefObject<BreathEngine>,
  setHr: (hr: number) => void,
  audioCtx: AudioContext | null,
  isBeepOnRef: React.RefObject<boolean>,
  graphRef: React.RefObject<GraphEngine | null>,
  isSimRunningRef: React.RefObject<boolean>
) => {
  const [engine, setEngine] = useState<RhythmEngine | null>(null);

  useEffect(() => {
    const graph = graphRef.current ?? (graphRef.current = GraphEngine.createDefaultEngine());
    updateGraphEngineFromSim(simOptionsRef.current!, graph);

    const rhythmEngine = new RhythmEngine({
      graph,
      bufferRef,
      audioCtx,
      isBeepOn: () => isBeepOnRef.current,
      getVitals: () => {
        const raw = simOptionsRef.current!.getRaw();
        return {
          spo2: Number(raw.spo2 ?? -1),
          nibp_sys: Number(raw.nibp_sys ?? 120),
          nibp_dia: Number(raw.nibp_dia ?? 70),
          etco2: Number(raw.etco2 ?? 38),
          pi: Number(raw.pi ?? 2),
        };
      },
      onHrUpdate: setHr,
      breathEngine: breathEngineRef.current!,
    });

    setEngine(rhythmEngine);
    rhythmEngine.setOnHrUpdate(setHr);

    let animationId: number;
    const loop = (now: number) => {
      if (isSimRunningRef.current) {
        rhythmEngine.step(now / 1000, isSimRunningRef.current);
      }
      animationId = requestAnimationFrame(loop);
    };
    console.log(`🚀 PULSEDOM Version: ${PULSEDOM_VERSION}`);
    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, [simOptionsRef, bufferRef, breathEngineRef, setHr, audioCtx, isBeepOnRef, graphRef, isSimRunningRef]);
};
