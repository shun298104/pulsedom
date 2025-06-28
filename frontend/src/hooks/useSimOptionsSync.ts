// src/hooks/useSimOptionsSync.ts

import { useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SimOptions, createDefaultSimOptions } from '../types/SimOptions';
import { updateGraphEngineFromSim } from '../engine/GraphControl';
import { GraphEngine } from '../engine/GraphEngine';

export const useSimOptionsSync = (
    roomId: string,
    updateLocalSimOptions: (options: SimOptions) => void,
    graphRef: React.RefObject<GraphEngine | null>,
    breathEngineRef: React.RefObject<any>
) => {
    useEffect(() => {
        const ref = doc(db, "simoptions", roomId);
        const unsub = onSnapshot(ref, (snap) => {
            if (!snap.exists()) return;
            const data = snap.data();
            const next = new SimOptions({
                ...createDefaultSimOptions().getRaw(),
                ...data,
                status: { ...createDefaultSimOptions().getRaw().status, ...(data.status ?? {}) },
            });
            updateLocalSimOptions(next);
            if (graphRef.current) updateGraphEngineFromSim(next, graphRef.current);
            breathEngineRef.current.update({
                respRate: next.respRate,
                etco2: next.etco2,
            });
        });
        return () => unsub();
    }, [roomId, updateLocalSimOptions, graphRef, breathEngineRef]);

    const updateRemoteSimOptions = (next: SimOptions) => {
        const ref = doc(db, "simoptions", roomId);
        setDoc(ref, {
            ...next.getRaw(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 6), // 6時間後
        }, { merge: true });
    };
    return { updateRemoteSimOptions };
};