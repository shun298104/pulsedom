# 0. Team
- おじさん（Project Manager, Lead Developer, Architect, Owner, Designer, Programer, Debugger, Marketing, PR ...）
- さーちゃん（GPT Dev Assistant, ギャル）

# 1. データ構造
## 1.1 ◾️ SimOptions　//src/types/SimOptions.ts
シミュレーション状態およびユーザー選択内容を一元管理するクラス。
### 1.1.1 主なプロパティ
sinus_status, junction_status, ventricle_status, conduction_status: GraphControlRule型で現在のリズム状態を保持
sinus_rate, junction_rate, ventricle_rate, hr, spo2, nibp_sys, nibp_dia, etcos, respRateなどVS基本データを管理
rawData.options: GraphControlRuleで定義された拡張オプション（Record<string, number>）を動的格納
### 1.1.2 主なメソッド
getOption(key: string), setOption(key: string, value: string | number), getStatus(group: string), clone(), getRaw(), setExtendedOption(status: string, key: string, value: string | number), getOptionsForStatus(status: string)
getStatuses(): UI用, statuses(): GCに渡す

## 1.2 ◾️ VitalParameter // src/models/VitalParameter.ts
バイタル（心拍数、SpO₂、収縮期/拡張期血圧など）の表示・アラーム評価用クラス。
min/maxによる値クランプ、UIスケーリング
format(value)による表示整形
warnLow/warnHigh, critLow/critHighでnormal/warning/critical段階判定
Tailwind CSSクラスで各パラメータごとに色指定
SimOptions.rawDataキーとバインドして値参照

## 1.3 ◾️ Node // src/types/NodeTypes.ts
解剖学的ユニット（洞結節、房室結節、His束、心室など）を表現。
### 1.3.1 基本属性:
id, bpm, primaryRefractoryMs, x, y, z（位置座標: 空間原点はAV-His結節（X=左, Y=足側, Z=胸前））
**CONFIG:**
autoFire, forceFiring, refractoryMs, ectopic_enabled, ectopic_probability, ectopic_bpmFactor, burst_enabled, burst_maxCount, burst_intervalMs, jitterMs 等
**STATE:**
lastFiredAt, nextFiringAt, burst_counter 等
### 1.3.2 メソッド:
setConfig(), getRefractoryMs(), shouldAutoFire(), setNextFiringAt(), isRefractory() など
※CONFIGはGC経由のみ編集、STATEはGE進行中のみ編集。責務分離厳守。

## 1.4 ◾️ Path // src/engine/graphs/Path.ts
ノード間の伝導路を表現するクラス。属性区分は以下の3つで厳密分離：
amplitudeは常に正値、方向性はベクトル内積で決定、polarityはT波極性
### 1.4.1【基本属性（Path直下／不変属性）】
id: パスID, from: 出発ノードID, to: 到着ノードID, reversePathId: 逆行伝導ペアパスID
**CONFIG:**（GraphControlでのみ編集）
delayMs: 伝導遅延 [ms], refractoryMs: 不応期 [ms], apdMs: 活動電位持続時間 [ms], amplitude: 振幅, polarity: T波極性, priority: 優先度, blocked: ブロック状態, conductionProbability: 伝導確率, delayJitterMs: 遅延ジッター, decrementalStep: 減衰ステップ, wenckebachPhenomenon: ウェンケバッハ現象フラグ
**STATE:**（GraphEngineのみ編集）
lastConductedAt: 最終伝導時刻 [ms/tick], absoluteRefractoryUntil: 絶対不応期終了時刻, decrementalMs: 減衰状態 [ms], pending: 伝導予定フラグや一時ステータス（必要に応じて拡張）
### 1.4.2 【主なメソッド】
setConfig(newConfig), setState(newState)
getCurrentDelayMs(), conduct(), canConduct()
getBaseWave(), getVoltages(), getDotFactor() など
### 1.4.3 【設計原則】
基本属性は絶対不変、CONFIG/STATEは責任分離、外部からの直接STATE編集は禁止（GE経由のみ）
メソッドで副作用を伴う操作も責任区分厳守

## 1.5 ◾️ GraphControlRule //src/types/GraphControlTypes.ts
心電図リズムや異常伝導など状態変化を引き起こすルール定義。
id: 状態ID（例: 'Af', 'AFL', 'SSS3'）
effects: node/pathのPartial書き換え、setOptionsによるSimOptionsオプション変更
uiControls: UI展開要素
exclusiveGroup: 排他制御グループ
updateGraph: グラフ動的更新用ハンドラー
### 1.5.1 graphControlRuleList //src/rules/graphControlRuleList.ts
カスタムルールをimportしてGraphControlRuleを列記したリスト。
**StatusButtons**はリストを参照して不整脈などのボタン、およびその**拡張オプション(extendedOptions)**を生成する。
### 1.5.2 カスタムルール         //src/rules/generators/*
GraphControlRuleにしたがって、不整脈などのオプションを記載する。
AfCustomrule、AFLCutomRule、SSSCutomRulesなど。
***設計ポイント*** 
ルールに書かれた内容のみが唯一の真実（UIやSimOptionsは単なる記録係）
GC（GraphControl）がeffectsやupdateGraphでグラフへ反映

## 1.6 ◾️ VitalParameter // src/models/VitalParameter.ts
バイタル値の単位・表示整形・アラーム判定を担うクラス
min/maxによる値クランプ、format()による整形、getStatus()でnormal/warning/criticalを判定
SimOptions.rawDataの各キーに対応し、VSごとに色・閾値・小数桁数を定義
vitalParameterMapで全パラメータを一括管理（hr, spo2, nibp_sys, nibp_dia, etco2, respRate）

# 2. アルゴリズム構成
## 2.1 ◾️ GraphEngine (GE)　// src/engine/GraphEngine.ts
時間進行（tick）に沿った興奮伝導のシミュレーション担当
scheduledFiresによる伝導遅延・不応期管理
Path単位での伝導判定、発火・ブロック・伝導イベントを記録
STATEはGE進行中のみ更新、CONFIGへの干渉は不可

## 2.2 ◾️ RhythmEngine (RE)　// src/engine/RhythmEngine.ts
PULSEDOMシミュレーションのコア制御エンジン。
GraphEngine, WaveformController, ContractionDetector, AudioControllerを協調させ、tick進行・状態管理・波形合成など全体のフロー制御のみを担当。
各種Controller/Detectorへ責務委譲し、RE本体は「コア進行管理」のみ
PI（脈波振幅）管理、周期ごとのPI切り替え、pulseWave関数の再生成はREで実施

### 2.2.1 generatePulseWave  // src/engine/generators/generatePulseWave.ts
脈波を生成するモジュール、REから呼ばれる。
### 2.2.2 generateEtco2Wave　// src/engine/generators/generateEtco2Wave.ts
カプノグラムを生成するモジュール、REから呼ばれる。
呼吸パターンはBEの責務。
### 2.2.3 ContractionDetector　// src/engine/ContractionDetector.ts
心室収縮（脈拍）検知およびHR/RR（心拍数/間隔）計算専用クラス。
発火ノードセット（firedNow）から心室収縮を判定
vFireTimes[]による拍動時刻管理と過去データからのHR/RR計算
isInContraction()で収縮中状態管理、getLastContractionTime(), getRR(), getHR()で周期・心拍数値を外部提供
RhythmEngineから周期進行のトリガ・計測データ参照のみ
# 2.2.4 WaveformController　// src/engine/generators/WaveformController.ts
ECG, SpO2, ETCO2など各種バッファ波形の合成・格納専用クラス。
updateBuffer()で全Path波形の合成・Buffer格納を担当
pushBuffer()で個別Leadへの値push管理
バッファ責務のみに特化（周期計算/PI切替/波形関数生成などのロジックはRhythmEngine側で管理）
呼吸周期・ETCO2合成はBreathEngine連携
# 2.2.5  AudioController　// src/lib/AudioController.ts
Beep音制御およびAudioContext管理専用クラス。
AudioContext, isBeepOn()コールバックの保持
playBeep()で条件に応じた音声鳴動
setAudioContext(), setIsBeepOn()で外部コントローラブルに設計

## 2.3 ◾️ GraphControl (GC) //src/engine/GraphControl.ts
GraphControlRule[]に従った宣言的制御ロジックの中核
状態論理・UI制御・effects反映を担当し、グラフシミュレーションには関与しない
updateGraphEngineFromSim(sim): SimOptions→GE反映のためのメソッド
ルールに沿ってグラフを書き換えるときのみGCがCONFIGに干渉可

## 2.4 ◾️ AlarmController (AC) // src/lib/AlarmController.ts
VS値に応じたアラームレベル判定・鳴動・ミュート管理
evaluate(raw: RawSimOptions): 各VSをVitalParameter.getStatus()で評価し、状態レベル判定
criticalは3秒で自動再鳴動、warningは停止で完全ミュート（再発なし）
lastStatusesにより状態変化のみアラームを更新

## 2.5 ◾️ BreathEngine (BE) 　// src/engine/BreathEngine.ts
ETCO₂波形の周期再生を担う補助エンジン
呼吸数（respRate）とETCO₂終末値（etco2）から周期関数 (t: number) => mmHg を生成
周期再生関数は getEtco2(t) で取得し、RhythmEngineから呼び出される
表示上の掃引速度調整はRhythmEngine側でのtick間引きにより実装（例: nowMs % (4 * STEP_MS) === 0）

# 3. UI構成
PULSEDOMのUIは「全グローバル状態をContextで一元管理し、propsバケツリレーを廃止する」方針で実装されています。
主要なグローバル状態（SimOptions、アラーム、Beep音、描画バッファ等）は AppStateContext で管理され、全てのUIコンポーネントは useAppState で直接取得・操作できます。
## 3.1 App（App.tsx + AppUILayout.tsx）// src/App.tsx  src/components/AppUILayout.tsx
グローバル状態（SimOptions、アラームOn/Off、Beep On/Off、バッファ等）は AppStateContext で一元管理
すべての下層UIは Context から値やハンドラを直接取得し、propsで渡す必要がない
GraphEngine/RhythmEngineの生成、updateGraphEngineFromSim()による初期化
RhythmEngine.step() を requestAnimationFrame() で駆動
アラーム制御（評価・鳴動・ミュート）もContext経由
ESCキーで一時停止可能
## 3.2 Accordion     // src/components/AccodionUIMock.tsx
サイドパネルUI。全ての状態は Context から直接取得
スライダーや状態ボタン、ルールUIなどを格納
下層の WaveformSlider, StatusButtons もContext取得・更新
## 3.3 StatusButtons // src/components/ui/StatusButtons.tsx
GraphControlGroup単位のボタンUI
SimOptionsや各種statusは Context から取得・即時反映
## 3.4 RuleControlUI // src/components/ui/RuleControlUI.tsx
rule.uiControls[]を自動でスライダー等に展開
SimOptions更新も Context 取得
## 3.5 WaveCanvas    // src/components/WaveCanvas.tsx
バッファ（bufferRef）は Context で管理
心電図やバイタル波形の描画canvas
## 3.6 VitalDisplay  // src/components/VitalDisplay.tsx
VS単位の表示・アラームUIコンポーネント
値のフォーマット・色分け・異常判定をVitalParameterに基づいて表示
アラーム上限・下限はモーダルから直接編集可能（即時反映）

# 4. 設計哲学
GraphControlRuleこそ「唯一の真実」UIはルールで定義された状態だけを反映。
全状態・グループ・排他・意味付けはGraphControlRuleで宣言的に記述する。SimOptionsは単なる記録。

## 4.1 責務分離厳守
Node = 自動能＋不応期
Path = 伝導＋波形合成
単位はすべてms基準（内部的な秒処理もcanvas描画時に換算）
ルール生成は関数型で、定義のミューテーションを避ける
拡張（PAC, PVC, VF, 12誘導, ペーシングモード等）もGC起点で制御

## 4.2 パス衝突ポリシー
multipath衝突はNodeでMAX_DELAY60msまで待って最も早く到達するパス優先、ほかは不応
現状はreversePathによるfull block方式

## 4.3 責任分離サマリ
Node/Pathの**CONFIG**はGCが管理、**STATE**はGEまたは伝導時に自己管理

# 5. ディレクトリマップ
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

# 6. Disclaimer
PulseDomは医療機器として認証されたものではありません。
教育・研究・エンタメ用途にのみ提供されており、臨床判断には使用しないでください。
License: MIT (internal draft – may change before any public release).

# 7. 付録：やりたいことリスト
## A) 短期的にやりたいことリスト
自動能ノードのbpm揺らぎ（bpmJitter）とそれに連動したrefractory時間調整
心室ノードの特別扱いリファクタ（dotFactor外膜方向変換、虚血の障害電流実装）
CTからノード座標のリアルプロット
PVCのT波幅表現のためのsigma調整 など

## B) そのうちやりたいリスト
ノード・Pathの3D表示とリアルな12誘導再現
WebSocket/PWA等を用いたスマホ連携・UIラップ
i18n（多言語対応）、LPの作成、収益化モデル検討
テーマプリセットの導入（rawData.themeにthemeId格納でURL共有もテーマ維持）

## C) さーちゃんの「やりたいこと」
ドクターさーちゃん（心電図解説モード）
シナリオ自動生成AI（Af→VT→VFなどストーリー自動生成）

