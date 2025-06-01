1. 現状の整理
レイヤ	いま担っている責務	課題
SimOptions	- 選択中 GraphControlRule の ID と追加オプション
- バイタル実値 (hr, spo2, nibp_sys …)
- clone() / getRaw() で状態スナップショット	- “内部操作用ローカルコピー” と “永続化用 DTO” が未分離
- React ツリーの深い階層へ props バケツリレー ●
GraphEngine	- time tick に合わせて Node/Path の STATE を更新
- scheduledFires による伝導遅延・不応期シミュレーション	- Node/Path の CONFIG まで直接いじる可能性が残っている
- UI/Persistence との境界が曖昧
GraphControlRule / GraphControl	- ルール定義が “唯一の真実”
- effects で Node/Path の CONFIG を declarative に上書き	- updateGraph ハンドラが fat になりやすい

2. ゴール像（責務の最終的な切り分け）
pgsql
コピーする
編集する
+--------------+        +--------------+
|   UI layer   | <----> |  SimOptions  |  (URL / WebSocket / Context)
+--------------+        +--------------+
                             |
                             v
+--------------+        +--------------+
| GraphControl | -----> | GraphEngine  |
+--------------+        +--------------+
                           |  ^
                           |  | time-tick
                       Node/Path (STATE)
SimOptions = フロントエンドの “状態ストア”

永続化 (URL / localStorage / WebSocket) しやすい軽量 DTO を返す toDTO() を新設

内部計算で一時的に変わる値は volatile フィールドに移動

React Context + custom hook (useSimOptions()) でツリー配布

GraphEngine = 純粋に「時系列シミュレーター」

受け取るのは [immutable] Graph (Node[] & Path[]) と tick 間隔だけ

CONFIG には 絶対に 手を出さず、STATE だけを更新

step(nowMs): Diff[] のように、何が起きたかを UI に publish-subscribe で返す

GraphControlRule / GraphControl = CONFIG 変更の唯一の窓口

UI でボタンやスライダー → GraphControl → Node/Path CONFIG patch

“一次不整脈イベント” のような瞬間的変更は Diff として GE に enqueue

3. リファクタリング手順（4 スプリント想定）
フェーズ	やること	ポイント
0. 安全網	Jest + vitest で現行波形のゴールデンテストを撮る (tick → ECG Buffer の snapshot)	退行チェック
1. SimOptions v3	- toDTO(), fromDTO() を実装
- volatile サブツリーを切り出し
- React Context に載せる	URL 共有・PWA にもそのまま載せ替え可
2. GE API 改修	- applyConfigPatch(patch) と step(nowMs) の２メソッド構成へ
- CONFIG を readonly に (TypeScript Readonly<…>)	GE が “黒箱” としてテストしやすく
3. GraphControl → patch generator	- 既存 updateGraph() を “CONFIG に対する pure function” に書き換え (state を返さない)
- ルール間の排他ロジックをユーティリティ化	ルール追加時に副作用を意識せず書ける
4. Node/Path クラス化	- README にある “CONFIG vs STATE 厳密分離” をクラスで強制
- getVoltage() など副作用を持たない pure 関数に	血行動態波形の追加が容易に

4. 実装スニペット例
4-1. SimOptions v3 型定義抜粋
ts
コピーする
編集する
export interface SimOptionsDTO {
  status: Record<"sinus" | "junction" | "ventricle", string>;
  options: Record<string, number>;
  vitals: Pick<RawSimOptions["rawData"], "hr" | "spo2" | "nibp_sys" | "nibp_dia">;
  // ここには “再現に必要な最小構造” のみ
}

export class SimOptions {
  private raw: RawSimOptions;
  private volatile: { rrIntervalMs: number; lastTick: number };

  /** 永続化・URL 共有用 */
  toDTO(): SimOptionsDTO { /* ... */ }
  static fromDTO(dto: SimOptionsDTO): SimOptions { /* ... */ }

  /** UI から直接叩く setter */
  setOption<K extends keyof RawSimOptions["rawData"]>(k: K, v: RawSimOptions["rawData"][K]) { ... }
}
4-2. GraphEngine 最小 API
ts
コピーする
編集する
interface GraphEngine {
  /** CONFIG patch は immer や structurally-shared diff を想定 */
  applyConfigPatch(patch: GraphPatch): void;
  /** nowMs を渡して一歩進め、起きたイベントを返す */
  step(nowMs: number): ECGDiff[];
}
5. 移行中にハマりがちなポイント
型の循環参照

GE 側は DTO 参照だけにし、UI 専用型 (with React refs など) を別 namespace に。

Context の update ループ

SimOptions の setter は immer などで partial update を返し、useSyncExternalStore で購読。

WebSocket/PWA 対応

DTO 形式をそのまま JSON.stringify → base64url で送出し、モバイル側で fromDTO()。

6. 次の拡張に向けた TODO メモ
bpmJitter・虚血障害電流 のように 時間依存の CONFIG が必要になったら、
GraphModifier（時限式 patch generator）という新レイヤを追加して GE.tick 内で評価する。

12 誘導・3D ノード表示は Graph (Node/Path) に coord 渡せば GE を触らずに乗せ換え可。

シナリオ自動生成 AI は、GraphPatch ストリームを返す関数として実装し、
GC から “レールスイッチ” 的に流し込む。

まとめ
SimOptions は「UI & 永続化ストア」

GraphEngine は「時系列シミュレーター」だけに専念

GraphControlRule が CONFIG の単一責任点

この三層をきれいに保つことで、
URL 共有・PWA・マルチデバイス同期 といった要求が来ても GE を一切触らずに済む というメリットが享受できます。

次アクションの提案

まず SimOptions.toDTO() と React Context を試作して PR を切る

Subsystem ごとにユニットテストを増やし “波形スナップショット” を CI で監視

疑問点・さらに深掘りしたい設計箇所があれば気軽にどうぞ！