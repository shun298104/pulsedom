import { useEffect } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SimOptions } from "../types/SimOptions";
import { WaveBufferMap } from "../engine/WaveBuffer";

/**
 * Firestoreの症例ケースのVS・シミュデータ・buffer同期責務を一元管理するHook
 *
 * @param caseId - FirestoreのケースID
 * @param onSimOptions - FirestoreからVSデータ（SimOptions）受信時のcallback
 * @param graphRef - GraphEngineインスタンス参照
 * @param breathEngineRef - BreathEngineインスタンス参照
 * @param bufferRef - (option) サーバ時のみ：pushしたいbufferRef。クライアント時はundefined
 * @param onBuffer - (option) クライアント時のみ：受信bufferをセットするコールバック
 *
 * @returns { updateRemoteCases, pushBufferToFirestore }
 */
export function useCasesSync(
  caseId: string,
  onSimOptions: (options: SimOptions) => void,
  bufferRef?: React.MutableRefObject<WaveBufferMap>,     // サーバ時のみ渡す
  onBuffer?: (buffer: Record<string, number[]>) => void             // クライアント時のみ渡す
) {
  // VS・シミュオプションのFirestore同期（従来ロジック）
  useEffect(() => {
    if (!caseId) return;
    const ref = doc(db, "cases", caseId);
    const unsubscribe = onSnapshot(ref, (snap) => {
      console.log('[useCasesSync] snap.data:', snap.data && snap.data());
      if (!snap.exists()) return;
      const data = snap.data();
      const simOptions = new SimOptions(data.simOptions);
      onSimOptions(simOptions);
      if (onBuffer && data.buffer) {
        onBuffer(data.buffer as Record<string, number[]>);
      }
    });

    return () => unsubscribe();
  }, [caseId, onSimOptions, onBuffer]);

  // FirestoreへVS/simOptions書き込み
  const updateRemoteCases = async (options: SimOptions) => {
    console.log("[updateRemoteCases] Firestore write", options.getRaw());
    if (!caseId) return;
    const ref = doc(db, "cases", caseId);
    try {
      await updateDoc(ref, { simOptions: options.getRaw() });
      console.log("[updateRemoteCases] Firestore write success");
    } catch (e) {
      console.log("[updateRemoteCases] Firestore write error", e);
    }
  };

  // サーバ時のみbufferをFirestoreにpush
  const pushBufferToFirestore = async () => {
    if (!caseId || !bufferRef) return;
    const ref = doc(db, "cases", caseId);
    // 全リードのbufferをオブジェクトとしてFirestoreに保存
    const bufferObj: any = {};
    for (const [key, buf] of Object.entries(bufferRef.current)) {
      bufferObj[key] = buf.toArray ? buf.toArray() : buf; // toArray()で配列化（要実装依存）
    }
    await updateDoc(ref, {
      buffer: bufferObj,
    });
  };

  return {
    updateRemoteCases,
    pushBufferToFirestore,
  };
}
