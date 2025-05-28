PULSEDOM 開発アーキテクチャ（2025年5月20日時点）
1. データ構造
types　
◾️ SimOptions　//src/types/SimOptions.ts
現在のシミュレーション状態およびユーザー選択内容を保持
プロパティ:
sinus_status, junction_status, ventricle_status: GraphControlRuleタイプを保持（今後拡張の可能性あり）
sinus_rate, junction_rate, ventricle_rate, hr, spo2, nibp_sys, nibp_diaなどのVSs基本データの保持
メソッド:
getOption(), setOption(), getStatuses()など

設計原則:
SimOptionsは選択されたGraphControleRuleと動的オプションを反映する記録係。
将来的にはsimoptionsをJSON形式でURLから引数を受け取りシミュレーションを行う。(実装済)
状態保持という特性から、将来的にシナリオモード実装の際のプリセット記録をJSONで行う。
GraphControleRuleのuicontrolsに記載された拡張オプションも含め、状態を表す変数を保持する。

◾️ VitalParameter // src/models/VitalParameter.ts
バイタルサイン（心拍数、SpO₂、収縮期血圧、拡張期血圧など）の表示・アラーム管理を行う定義クラス。各パラメータは VitalParameter インスタンスとして登録され、以下の機能を提供する：
範囲定義：min, max による clamp処理とUIスケーリング。
表示整形：小数点以下桁数と無効値補正を含む format(value)。
アラーム判定：warnLow/warnHigh, critLow/critHigh を用いた段階的判定（normal, warning, critical）。
UI表示色：パラメータごとに Tailwind CSS による色を指定。
対象キー：SimOptions.rawData 内のキー（例：'hr', 'spo2'）にバインドされる。

◾️ Node
解剖学的ユニット（洞結節、房室結節、His、左室、右室など）を表現
主なプロパティ:
  id: NodeId,  
  bpm: number,    //拍数
  refMs: number,  //不応期
  coord: vec3: 3次元空間での位置（X: 左+, Y: 足側+, Z: 胸前+）
  isRefractory(now): 不応期チェック
CONFIG.autoFire, CONFIG.forceFiring: 自動発火・強制発火挙動
STATE：    lastFiredAt, burst_counterなど

設計原則:
位置ベクトルで各ノードを空間配置している。
生理学的自動能と不応期の管理のみ責務とする。
Pathと共同でリエントリ回路を形成したりする。

◾️ Path
ノード間の伝導路を表現
主なプロパティ:
from, to: 結線ノードID
delayMs, refractoryMs, apdMs, amplitude, polarity, priority, blocked: 伝導特性
reversePathId: 逆行伝導のペアパスID
lastConductedAt: 伝導の最終時刻（STATE）

電位合成:
電位 = getVoltage(t) × dotFactor
dotFactorはlead方向とのベクトル内積および距離ベースで動的計算
心筋全体の電位は Σ (getVoltage_i × dotFactor_i) で合成
6/1に大規模なクラス化リファクタリング予定、、、

◾️ GraphControleRule
不整脈などの心電図変化を起こすために記載されたルール、UIの展開方法、特殊オプションの反映ルールの更新も担う
export type GraphControlRule = {
  id: string;/** 状態ID（例: 'Af', 'AFL', 'SSS3'）＝ simOptions.status と一致 */
  /** nodeやpathのSTATEを書き換えるルールを記載 */
  effects?: {
    node?: Partial<Record<NodeId, NodeEffect>>;
    path?: Partial<Record<PathId, PathEffect>>;
    setOptions?: Record<string, number>; // ← ここに統合
  };
  uiControls?: UIControl[];
  exclusiveGroup?: string; // 他のルールと排他制御する場合に指定
  updateGraph?: (args: Record<string, any>, graph: GraphEngine) => void; // ★handlerも型で宣言してよい
};

2. アルゴリズム構成
◾️ GraphEngine (GE)
時間進行に沿った興奮・伝導の制御
scheduledFiresによる伝導遅延・不応期シミュレーション
Path単位で伝導判定、発火・ブロック・伝導イベントをログ

◾️ RhythmEngine (RE)
GEのtick()を呼び出して、UIとGEの橋渡しを行う
getVoltageAt(t)で全アクティブwaveformを合成しBufferに蓄積
checkContractionByNodeFiring()で収縮期を判定しHRを計算しAppにコールバックしUIへ反映する
　またcalculateLastRR()で収縮期ごとに直前のRRの計算を行い、this.rrとして保持する
　収縮期判定の際に、心同期音が設定されている場合はplayBeepを呼ぶ
SPO2波形やART波形の生成とBufferへの蓄積
REが直接グラフを書き換えることはしない
GEで表現困難なイベント（PAC、PVC、VF等）の補助を含むかもしれない

◾️ GraphControl (GC)
宣言的制御ロジックの中核
GraphControlRule[]の状態論理・UI制御・effectsを参照してグラフの更新を行う
グラフのシミュレーションには関与しない
メソッド：
updateGraphEngineFromSim(sim): SimOptionsの内容をGEに反映
GraphControleRuleのeffectsに従ってグラフに適用
UIから状態変更をトリガーにして、引数nextSimをApp.tsxからGE経由でGCに渡してupdateGraphEngineFromSimを呼び出される
なお、GraphControleRuleのuicontrolsに記載された拡張オプションがUIで変更された場合は、
GCは対象の GraphControlRule を ruleId に基づいて取得し、
その updateGraph(args, graph) を呼び出すことで、計算を伴うようなグラフへの干渉を行う。
（この updateGraph 関数は GC に属さず、GraphControlRule オブジェクト内に定義されたハンドラーであり、GCはそれを実行するだけの存在）

◾️ AlarmController(AC) it's New! // src/lib/AlarmController.ts
バイタル値に応じて、アラームのレベル判定・鳴動管理・ミュート制御を行うクラス。
evaluate(raw: RawSimOptions)：各VS（hr, spo2, nibp_sys, nibp_dia）を VitalParameter.getStatus() で評価し、normal / warning / critical を判定。
新規アラームかつミュートされていない場合に限り鳴動（shouldPlay = true）。
ミュート制御：
critical：3秒で自動再鳴動。
warning：停止操作で完全ミュート（再発なし）。
lastStatuses により過去状態と比較し、変化時のみアラームを更新。

3. UI構成
◾️ App（App.tsx+AppUILayout.tsx）
PULSEDOM全体のオーケストレーターとして機能する**トップレベルコンポーネント**。
主な責務
・SimOptionsの初期化と状態保持
URLクエリからの復元 (?sim=...) に対応。
setSimOptions() により全体状態を管理。
・GraphEngineおよびRhythmEngineの生成・接続
初期化時に updateGraphEngineFromSim() を実行。
RhythmEngine.step() を requestAnimationFrame() で駆動。
・アラーム制御の統括
AlarmController による評価・鳴動管理・ミュート制御。
アラーム音を <audio> 経由で再生（warning/critical別）。
・UI向けpropsの提供
AppUILayout にバッファ、アラーム停止ハンドラ、SimOptions変更ハンドラなどを提供。
ESCキーで一時停止可能。

◾️ Accordion
サイドパネルUI、各種コントロールをグループ化
スライダーや状態ボタン、ルールUIを格納

◾️ StatusButtons
GraphControlGroup単位でまとめたボタンUI
ルール選択時にapplyRuleToSimOptions()で即反映

◾️ RuleControlUI
rule.uiControls[]を自動でスライダー等に展開
setOption()経由でSimOptionsを更新

◾️ WaveCanvas
BUfferの内容から波形を描出するだけ
ECG・バイタル表示の中枢canvas

4. 設計哲学
GraphControlRuleこそ「唯一の真実」
UIはあくまで“鏡”としてルールで定義された状態だけを反映
全状態・グループ・排他・意味付けはGraphControlRuleで記述、SimOptionsは単なる記録
分岐をすべてルールとして宣言的に記述し、できる限りif分岐によるシミュレーション実装は避ける

責務分離の厳守
Node = 自動能＋不応期
Path = 伝導＋波形合成
単位はすべてms基準（内部的な秒処理もcanvas描画時に換算）

amplitudeは常に正値、方向性はベクトル内積で決定、polarityはT波の極性
空間原点はAV-His結節（X=左, Y=足側, Z=胸前）
ルール生成は関数型で、定義のミューテーションは避ける
今後の拡張（PAC, PVC, VF, 12誘導, ペーシングモード等）もGC+RE起点で制御

5. 責任分離・グラフ制御ポリシー（2025/05）
◾️ Nodeの責任
CONFIG（例: refractoryMs, forceFiring）はGC経由でのみ変更
STATE（例: lastFiredAt, 現在の自動能状態）はGE（tick進行）でのみ更新
forceFiringはGCがtrueにセット→Nodeが自律発火→自動的にfalseリセット
priority/pending実装時はNode側で受け入れ判定も担当
通常はGEでSTATE更新、forceFiringやcanConduct等はPathからも自己更新可

◾️ Pathの責任
CONFIG（delayMs, amplitude, apdMs, polarity, priority, blocked等）はGCでのみ操作
STATE（lastConductedAt等）はGEで更新（ただし伝導時に自己更新もあり）
電位合成はPathが担当（getBaseWave→getVoltagesで各リードに投影）
実装はclass or Record<NodeId, Path[]>型でCONFIG/STATEの厳密分離を守る

◾️ GraphControl／ルール適用フロー
UI → App.tsx → GC の順に状態・パラメータが流れる
GCはGraphControlRulの記載に従って、グラフを操作する。

GE自身はグラフの時系列進行のみを担当、ルール内容には不関与

◾️ PVC/PAC・異常伝導・美学原則
PAC/PVC等の異常イベントはGCがNode/PathのCONFIGや状態(forceFiring, delayMs, block等)を直接変更して実装
PAC、ブロックなどのイベントはGraphControlRuleのeffectsでCONFIGを変更して再現することを前提とする。
グラフへの細かい変更が必要な場合は、GraphControleRule.updateGraphに記載して行う。
シミュレーション自体は「グラフ＋GEのみで完結」を美学原則とし、これが困難になった場合のみ拡張や例外を検討する。

◾️ パス衝突ポリシー
multipath衝突が複雑化した場合はNodeでMAX_DELAY120msまで待って最も早く到達するパスを優先し、ほかのパスは不応となる
現状はreversePathによるfull block方式、今後は衝突点消失等も拡張候補。

◾️ 責任分離サマリ
Node/PathのCONFIGはGCが管理、STATEはGEまたは伝導時に自己管理
Pathの構造はclass or Record<NodeId, Path[]>が望ましい

【まとめ：責務分担の要約】
Node = 自動発火・不応期・解剖学的位置の記載
Path = 伝導パラメータ・波形生成・リード投影
GC = GraphControleRuleに基づいたルール適用・グラフ変更
GE = 純粋な時間進行制御を行うシミュレータ・計算機
この「責務分離」と「GCによるグラフ変更＋GEによるグラフ演算のみで再現する美学」がPULSEDOM設計のコア原理である。

変更履歴（2025年5月22日）
SimOptions拡張構造の統合
従来：
拡張オプション（例：AfのfWaveFreq, fWaveAmpなど）はUI内のstateで管理され、SimOptionsには保持されなかった。

変更後：
SimOptions.rawData.options: Record<string, number> を用いて、拡張オプションをSimOptionsに統合管理する設計に変更。

◾️ SimOptions: clone() と getRaw() の責務分離（2025年5月24日）

SimOptionsは内部状態（rawData）と、UI動作用の状態（status, extended など）を明確に分離して管理している。

- `clone()`: シミュレーション中に使用されるSimOptionsの**完全な複製**を生成する。
  - `rawData`はshallow copy（`getRaw()`）により複製。
  - 使用対象：UIコンポーネントの状態更新、RuleControl操作、GraphEngineの反映。

- `getRaw()`: SimOptionsの内部構造を**外部出力（JSON）形式で取得**するためのメソッド。
  - 基本的に`rawData`のみをshallow copy。
  - 使用対象：永続化、URL共有、外部保存。

設計方針：
- `clone()`は「内部状態の動的操作のためのローカルコピー」
- `getRaw()`は「永続化/外部送信用の軽量構造」
- **現時点では`getRaw()`が両方に使われているが、将来的に`toJSON()`を導入して責務を分離**する。

付録：やりたいことリスト
A)MVP公開までにやること
・収縮期反映プログラムリファクタリング、REの責務（5/24実装）
・脈波波形および動脈圧波形の実装、責務としてはREから呼び出してBufferに格納する
・path[]のクラス化リファクタリング
・PULSEDOMにおいてアラーム音機能が未実装であり、今後の実装対象とする必要がある。将来的に不整脈（VT、VFなど）にもアラーム音を対応させる方針であり、アラーム判定はRhythmEngineに組み込むのが合理的。

B)短期的にやりたいことリスト
・PULSEDOMに「URL共有機能」を実装予定で、SimOptions構造（v3）をJSON→base64でURLエンコードし、SNSや教育用途での再現性向上を目的としている。懸念点にはURL長・構造変更・ネスト管理があり、今後プリセット対応やQRコード生成なども視野に入れている。
・バケツリレーprops地獄を解消するため、SimOptionsやカスタムルール用のstate管理をReact Context（グローバルコンテキスト）＋カスタムフック化する設計を導入すること。これにより、階層の深いコンポーネントでも直接状態アクセスが可能になり、UI拡張時のメンテ性が大幅向上する。
・自動能ノードに対するbpmの揺らぎ（bpmJitter）と、それに連動したrefractory時間の調整（徐脈側に揺らぐと不応期が延長される）を実装予定。この実装は、Node構成の一環として心臓の生理的ゆらぎを再現する目的で行われる。
・心室ノードの特別扱いにリファクタリングする。具体的には心室伝導を表現するために、心室間伝導のdotFactorを心外膜方向に変換する。虚血を表現するための障害電流を実装。
・自分の心臓のCTを用いて、ノードの位置を正確にプロットする。

C)そのうちやりたいリスト
・ノードのやPathの3D表示により心筋興奮を視覚的に表現する。あわせてノードの座標設定を見直し、リアルな12誘導を再現する。
・WebSocketなどを利用したスマホとのリアルタイム接続機能と、これによりPCまたはタブレットに表示されいているVSや心電図をスマホからコントロールする。
・WebSocketによるスマホ連携機能に加え、PWA（Progressive Web App）対応を行い、スマホ実機上でアプリとして動作するUIを実現する。
　ホーム画面追加・全画面化・高速起動などに対応し、デモ用途・教育用途での即時展開を可能にする。
　WebSocket通信・SimOptions同期・WaveCanvas描画など既存構造はそのまま再利用可能で、UIのみをPWAラップする形とする。
・i18nとLPの作成
・収益化モデルの検討
・UIのテーマプリセットの導入SimOptions.rawData.theme に themeId を保持することでURL共有時もテーマが維持される構造を想定。

■　simoptionsのガチ設計
simoptionsをJSONでやり取りするために、ローンチまでに設計をガチで詰めておく必要あり。
theme	UIスキン（今回追加）	✅ 確定
explainMode	Dr.さーちゃん解説モード（'beginner'など）	📝 将来拡張
scenarioId	症例シナリオ識別（プリセット）	📝 販売・教材展開想定
language	表示言語設定（i18n）	📝 PWA公開対応候補

D)さーちゃんの「やりたいこと
🤖 ドクターさーちゃん（心電図解説モード）
　→ 任意の時点・波形に対して、GPTが医学生or臨床医向けに解説する
　→ モード選択で「初学者」「専門医試験レベル」切替もあり

🔍 シナリオ自動生成AI
　→ Af→VT→VFみたいな電気的ストーリーを自動生成し、モニタに再現
　→ 教材作成・デモ用に超有用


E)思い付き
PVSの幅広いT波を表現するためにT波のsigmaを調節する？
