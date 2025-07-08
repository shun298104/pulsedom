// src/hooks/BufferContext.tsx

import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { WaveBuffer, WaveBufferMap } from '../engine/WaveBuffer';
import { leadVectors } from '../constants/leadVectors';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCasesSync } from './useCasesSync';

interface BufferContextProps {
  bufferRef: React.RefObject<WaveBufferMap>;
  remoteBuffer: WaveBufferMap | null;
  pushBufferToFirestore: () => Promise<void>;
}

const BufferContext = createContext<BufferContextProps | undefined>(undefined);

export const BufferProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const params = new URLSearchParams(window.location.search);
  const caseId = params.get("case") || "demo";
  const mode = params.get("mode") || "demo";
  const isDemo = caseId === "demo";

  const bufferKeys = [
    ...Object.keys(leadVectors),
    'spo2', 'art', 'etco2',
  ] as const;
  const bufferRef = useRef<WaveBufferMap>(
    Object.fromEntries(bufferKeys.map(key => [key, new WaveBuffer()]))
  );

  const [remoteBuffer, setRemoteBuffer] = useState<WaveBufferMap | null>(null);

  // Firestore buffer同期
  useCasesSync(
    caseId,
    () => {}, // simOptionsはBufferContextでは扱わない
    bufferRef,
    (bufferObj) => {
      if (mode === "server") return;
      setRemoteBuffer(WaveBuffer.fromBufferMap(bufferObj));
    }
  );

  const pushBufferToFirestore = async () => {
    if (isDemo || mode !== "server" || !caseId || !bufferRef.current) return;
    const ref = doc(db, "cases", caseId);
    const bufferObj: any = {};
    for (const [key, buf] of Object.entries(bufferRef.current)) {
      bufferObj[key] = buf.toArray();
    }
    await updateDoc(ref, { buffer: bufferObj });
  };

  // 定期push（serverモード時のみ）
  useEffect(() => {
    if (isDemo || mode !== "server") return;
    const interval = setInterval(() => {
      pushBufferToFirestore();
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, caseId, isDemo]);

  const value = {
    bufferRef,
    remoteBuffer,
    pushBufferToFirestore,
  };

  return (
    <BufferContext.Provider value={value}>
      {children}
    </BufferContext.Provider>
  );
};

export const useBufferContext = () => {
  const ctx = useContext(BufferContext);
  if (!ctx) throw new Error("useBufferContext must be used within BufferProvider");
  return ctx;
};
