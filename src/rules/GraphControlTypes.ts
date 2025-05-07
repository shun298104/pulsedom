//src/types/GraphControlTypes.ts

import type { NodeId } from '../types/NodeTypes';
import type { PathId } from '../engine/graphs/Path';

// グラフ制御グループ定義
// グラフ制御ルールをグループ分けするための定義
// 例: "不整脈", "刺激伝導系", "心筋虚血", "ペーシング", "特殊" など
export type GraphControlGroup =
  | 'AtrialStatus'
  | 'VentricularArrhythmia'
  | 'SSS'
  | 'Ischemia'
  | 'Pacing'
  | 'Special';

// ==========================
// ノードに対する効果定義
// ==========================
export type NodeEffect = Partial<{
  autofire: boolean;
  rate: number;
  refractory: number;
  // ectopicOptions の設定は将来的にここに統合できる
  'ectopic.enabled': boolean;
  'ectopic.probability': number;
  'ectopic.bpmFactor': number;
  'burst.maxCount': number;
  'burst.intervalMs': number;
}>;

// ==========================
// パスに対する効果定義
// ==========================
export type PathEffect = Partial<{
  block: boolean;
  delayMs: number;
  refractoryMs: number;
  delayJitterMs: number;  // ← 明示的に追加しとこ
  apdMs: number;
  amplitude: number;
  probability: number;
}>;

// ==========================
// グラフ制御ルール
// ==========================
export type GraphControlRule = {
  /** 状態ID（例: 'Af', 'AFL', 'SSS3'）＝ simOptions.status と一致 */
  id: string;

  /** UI表示名（i18n前提の英語、例: "Atrial Fibrillation"） */
  label?: string;

  /** 説明テキスト（i18n前提の英語） */
  description?: string;

  /** UI上の分類グループ（例: 'atrial arrhythmia'） */
  group?: GraphControlGroup

  exclusiveGroup?: GraphControlGroup; // 同じグループ内で排他制御する場合に指定

  /** 適用される効果一覧 */
  effects: {
    node?: Partial<Record<NodeId, NodeEffect>>;
    path?: Partial<Record<PathId, PathEffect>>;
  };
};
