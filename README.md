PULSEDOM 開発アーキテクチャ（2025年5月時点）
1. データ構造
◾️ SimOptions
現在のシミュレーション状態およびユーザー選択内容を保持

プロパティ:

sinus_status, junction_status, ventricle_status: ルールID（現在の状態を示す）

options: Record<string, number>: 周波数・振幅など動的パラメータを格納

メソッド:
getOption(), setOption(), getStatuses()

設計原則:
SimOptionsは「分類」処理は持たず、“選択されたルールIDと動的オプション”のみを反映する記録係。

◾️ Node
解剖学的ユニット（洞結節、房室結節、筋繊維など）を表現

主なプロパティ:

CONFIG.autoFire, CONFIG.forceFiring: 自動発火・強制発火挙動

isRefractory(now): 不応期チェック

coord: vec3: 3次元空間での位置（X: 左+, Y: 足側+, Z: 胸前+）

設計原則:
位置ベクトルで各ノードを空間配置し、生理学的自動能と不応期の管理のみ責務とする。

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

2. アルゴリズム構成
◾️ GraphEngine (GE)
時間進行に沿った興奮・伝導の制御

scheduledFiresによる伝導遅延・不応期シミュレーション

Path単位で伝導判定、発火・ブロック・伝導イベントをログ


◾️ RhythmEngine (RE)
GEのtick()を呼び出して、UIとGEの橋渡しを行う

getVoltageAt(t)で全アクティブwaveformを合成しBufferに蓄積

SPO2波形やART波形の生成とBufferへの蓄積

現在はGCルール経由のみでグラフ制御（REが直接グラフを書き換えることはしない）

GEで表現困難なイベント（PAC、PVC、VF等）の補助を含む

◾️ GraphControl (GC)
宣言的制御ロジックの中核

GraphControlRule[]が状態論理・UI制御・effectsを記述

メソッド：

applyRuleToSimOptions(rule, sim): ルールをSimOptionsに適用

updateGraphEngineFromSim(sim): SimOptionsの内容をGEに反映

AfCustomRule(f, a)のようなクロージャで動的ルール生成が可能

delay/amplitudeを内包したルールを柔軟に生成

3. UI構成
◾️ App
simOptions, graphRef, simOptionsRefなどを保持する全体オーケストレーター

ユーザー入出力のエントリポイント

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
Path.waveformFnから波形を合成・リアルタイム描画

dotProduct・leadVectorsで各誘導の電位を表示

ECG・バイタル表示の中枢canvas

4. 設計哲学
GraphControlRuleこそ「唯一の真実」

UIはあくまで“鏡”としてルールで定義された状態だけを反映

全状態・グループ・排他・意味付けはGCで記述、SimOptionsは単なる記録

分岐をすべてルールとして宣言的に記述（if分岐はコードに持たない）

責務分離の厳守

Node = 自動能＋不応期

Path = 伝導＋波形合成

単位はすべてms基準（内部的な秒処理もcanvas描画時に換算）

amplitudeは常に正値、方向性はベクトル内積で決定

空間原点はAV-His結節（X=左, Y=足側, Z=胸前）

ルール生成は関数型で（AfCustomRule(f, a)等）、定義のミューテーションは避ける

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
UI → App.tsx → GE → GC の順に状態・パラメータが流れる

App.tsxが各設定値をGEへ渡し、GEがGCにルール適用・パラメータ更新を依頼

GE自身はグラフの時系列進行のみを担当、ルール内容には不関与

◾️ PVC/PAC・異常伝導・美学原則
PAC/PVC等の異常イベントはGCがNode/PathのCONFIGや状態(forceFiring, delayMs, block等)を直接変更して実装

RE他コンポーネントはグラフ（Node/Path）を直接変更しない

「グラフ＋GEのみで完結」を美学原則とし、これが困難になった場合のみ拡張や例外を検討

◾️ 優先度・pending・パス衝突ポリシー
priority/pending/multipath衝突が複雑化した場合はNodeで審判APIを拡張

現状はreversePathによるfull block方式、今後は衝突点消失等も拡張候補

◾️ 責任分離サマリ
Node/PathのCONFIGはGCが管理、STATEはGEまたは伝導時に自己管理

Pathの構造はclass or Record<NodeId, Path[]>が望ましい

例外や設計変更が生じた場合は、必ずREADMEに明記すること

【まとめ：責務分担の要約】
Node = 自動発火・不応期・pending審判

Path = 伝導パラメータ・波形生成・リード投影

GC = ルール適用・グラフ操作の司令塔

GE = 純粋な時間進行制御

この「責務分離」と「GC＋グラフ＋GEのみで再現する美学」がPULSEDOM設計のコア原理である。

（上記内容に修正・例外・仕様追加が発生した場合は、全て本READMEに記録・追記すること。）