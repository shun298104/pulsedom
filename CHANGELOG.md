# Changelog
## [v0.9.3] - 2025-06-28
firestoreでの同期を実装、useCaseSyncを分離

## [v0.9.2] - 2025-06-27
ETCO2やRRの変更ををBEでpendingするように設計
simoptionsURLでstatusが復元されないバグを修正
PI(perfusion index)を実装、心周期はREの責務でpendingを実装
wavecanvasのリファクタで計算量を削減

## [v0.9.1] - 2025-06-23
### Added
- **BreathEngine**追加
- **simOptions**にetco2とrespRateを追加 
- **vitalParameter**にetco2とrespRateを追加
- モニタ画面にETCO2、RR、カプノグラムを表示
- カプノグラムにスケールラインを表示（vitalDisplayで抽象化）

### Fixed
- `setSimOptions()` の重複呼び出しによるログ2回出力を修正

---

## [v0.9.0] - 2025-06-20
- 初期公開準備版
