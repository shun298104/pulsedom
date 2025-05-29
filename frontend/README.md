PULSEDOM 開発アーキテクチャ

1. データ構造

---

### types

#### ◾️ SimOptions　//src/types/SimOptions.ts

* シミュレーション状態およびユーザー選択内容を保持
* sinus/junction/ventricle の GraphControlRule状態とVS（hr, spo2, nibpなど）を保持
* 拡張オプションは `rawData.options: Record<string, number>` に保持
* `clone()`：内部操作用ローカルコピー / `getRaw()`：永続化・送信用構造
* 将来的に `toJSON()` を導入予定

#### ◾️ VitalParameter // src/models/VitalParameter.ts

* VSの表示・アラーム管理
* clamp、format、アラーム判定（normal/warning/critical）、UI表示色、SimOptionsバインド

#### ◾️ Node

* 解剖学的ユニット、bpm/refMs/coordなど
* 自動能と不応期の管理が責務
* CONFIG: autoFire/forceFiring / STATE: lastFiredAt, burst\_counter

#### ◾️ Path

* from/to, delay, apd, amplitude, polarityなどの伝導特性
* reversePathId, lastConductedAtなどのSTATE
* 電位合成：dotFactor×getVoltage

#### ◾️ GraphControlRule

* 不整脈等のルール、UI展開、effects定義（node/path/setOptions）
* 排他グループ、updateGraph(args, graph)での制御可能

2. アルゴリズム構成

---

#### ◾️ GraphEngine (GE)

* 興奮・伝導制御、tickごとにscheduledFiresと不応期処理

#### ◾️ RhythmEngine (RE)

* GEを呼び出し、収縮期を判定し、Appに通知
* Voltage合成、RR計算、心同期音やSPO2波形生成も担当

#### ◾️ GraphControl (GC)

* SimOptionsからGEを更新、GraphControlRuleに従ってグラフを制御
* UI変更 → GCがruleId→rule.updateGraph()を実行

#### ◾️ AlarmController(AC)

* rawSimOptionsの評価、VitalParameterのgetStatus()で判定
* ミュート制御（criticalは3秒、warningは完全停止）
* 状態変化時のみアラーム更新

3. UI構成

---

#### ◾️ App（App.tsx+AppUILayout.tsx）

* SimOptions初期化、GE/RE接続、アラーム制御、UIにprops提供

#### ◾️ Accordion / StatusButtons / RuleControlUI

* UIコンポーネント。スライダー、状態ボタン、rule.uiControlsの展開

#### ◾️ WaveCanvas

* Bufferから波形描画

4. 設計哲学

---

* GraphControlRuleが唯一の真実、UIはその“鏡”
* 分岐は宣言的にルール記述、GC+RE起点での制御

### Node

* CONFIGはGC、STATEはGE
* forceFiringはGCがtrue→Nodeが発火→falseリセット

### Path

* CONFIGはGC、STATEはGE/自己更新
* 電位合成を担当、構造はclass or Record\<NodeId, Path\[]>型

### PVC/PACなど

* GCのeffectsでCONFIGを変更し再現、GraphControlRule.updateGraph()で微調整
* GE+グラフで完結することを原則とし、それが困難なときのみ拡張

### multipathポリシー

* MAX\_DELAYまで待って早着順優先、現状はreversePath block、今後拡張予定

5. ディレクトリマップ

---

```
frontend/
├─ assets
├─ audio
├─ components
│  ├─ three
│  └─ ui
├─ constants
├─ engine
│  ├─ graphs
│  └─ waveforms
├─ hooks
├─ lib
├─ rules
│  └─ generators
├─ types
└─ utils
```

6. Disclaimer

---

PulseDom is not a certified medical device.  It is provided solely for education, research, and entertainment.  Do not use it for clinical decision‑making.
License: MIT (internal draft – may change before any public release).

## 付録：やりたいことリスト

### A) MVP公開までにやること

* 脈波/動脈圧波形のRE実装とBuffer格納
* path\[]のクラス化

### B) 短期的にやりたいこと

* SimOptionsのURL共有機能（JSON→base64、QR対応も視野）
* SimOptions Context化によるバケツリレーprops解消
* bpmJitter＋refractory変動実装
* 心室ノードのrefactor（dotFactorと虚血電流）
* 自身のCTからノードプロット

### C) 将来的にやりたいこと

* Path/Nodeの3D表示＋12誘導再現
* WebSocketによるスマホ連携＋PWA化
* i18n対応、LP作成、UIテーマプリセット
* 収益化モデルの検討

### D) さーちゃんのやりたいこと

🤖 Dr.さーちゃん（ECG解説）
🔍 シナリオ自動生成AI（例：Af→VT→VF）

### E) 思い付き

* PVCのT波幅調整（sigma制御）
