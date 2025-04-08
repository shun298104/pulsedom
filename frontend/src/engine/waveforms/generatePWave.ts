export function generatePWave({
  hr = 80,                    // 心拍数（bpm）デフォルト80
  sinusStatus = "normal",     // 洞調律の状態：normal / LAE / RAE / ectopic / PM
  mgnfy = 1.0,                 // 波形の倍率（表示の拡大率）
  samplingRate = 200,         // サンプリングレート（1秒あたりの点数）
  matFlag = false,            // 多源性P波（MAT）フラグ：trueでランダム極性
}: {
  hr?: number;
  sinusStatus?: string;
  mgnfy?: number;
  samplingRate?: number;
  matFlag?: boolean;
}): number[] {
  const wave: number[] = [];

  // 標準的なP波持続（秒）
  const DEFAULT_DURATION = 0.07;
  // 標準的な左房成分のオフセット（秒）
  const DEFAULT_LEFT_OFFSET = 0.04;
  // ガウス関数の標準偏差（P波幅）
  const GAUSSIAN_STD_DEV = 0.015;

  // 心拍数に応じたP波持続と左房成分オフセットの調整
  const duration = hr > 80 ? 6 / hr : DEFAULT_DURATION;
  const leftOffset = hr > 80 ? duration * 0.5 : DEFAULT_LEFT_OFFSET;

  // 振幅の初期値（右房・左房）
  let rightAmp = 0.1;
  let leftAmp = 0.1;

  // 多源性P波の場合、ランダムで極性・振幅を決定
  if (matFlag) {
    const r = Math.random();
    if (r < 0.4) {
      rightAmp = 0.1; leftAmp = 0.1;
    } else if (r < 0.7) {
      rightAmp = -0.1; leftAmp = -0.1;
    } else if (r < 0.9) {
      rightAmp = 0.1; leftAmp = -0.2;
    } else {
      rightAmp = 0.125; leftAmp = 0.125;
    }
  } else {
    // 洞調律の状態に応じて極性を設定（例：RAEで右房優位）
    switch (sinusStatus) {
      case "LAE": rightAmp = 0.1; leftAmp = -0.18; break;
      case "RAE": rightAmp = 0.18; leftAmp = 0.1; break;
      case "ectopic": rightAmp = -0.1; leftAmp = -0.1; break;
      case "PM": rightAmp = 0.1; leftAmp = 0.1; break;
    }
  }

  const numSamples = Math.floor(duration * samplingRate); // 出力波形の点数
  const dt = 1 / samplingRate;                             // サンプリング間隔（秒）
  const rightCenter = duration / 2;                        // 右房成分の中心時間
  const leftCenter = leftOffset + duration / 2;            // 左房成分の中心時間

  // P波の時間波形を1点ずつ計算
  for (let i = 0; i < numSamples; i++) {
    const t = i * dt;
    // ガウス関数で左右房成分を生成
    const right = gaussian(rightAmp, t, rightCenter, duration, GAUSSIAN_STD_DEV);
    const left = gaussian(leftAmp, t, leftCenter, duration, GAUSSIAN_STD_DEV);
    // 合成して倍率をかけて小数第2位で丸める
    wave.push(Math.round((right + left) * mgnfy * 100) / 100);
  }

  return wave;
}

// ガウス波生成関数（中心値・振幅・分散を与えて、時間tでの値を返す）
function gaussian(amplitude: number, t: number, center: number, duration: number, stdDev: number): number {
  if (t < center - duration / 1.5 || t > center + duration / 1.5) return 0; // 範囲外はゼロ
  return amplitude * Math.exp(-((t - center) ** 2) / (2 * stdDev ** 2));
}

export function generateQRST({
  hr = 80,
  sinusStatus = "normal",
  ventStatus = "normal",
  q = -0.1,
  r = 1.0,
  s = -0.25,
  tHeight = 0.3,
  stAmp = 0.02,            // 🆕 STセグメントの高さ（通常は0.02〜0.05mV程度）
  stOffset = 0.06,         // 🆕 R波からT波までの距離（STセグメント長）
  mgnfy = 1.0,
  samplingRate = 200,
}: {
  hr?: number;
  sinusStatus?: string;
  ventStatus?: string;
  q?: number;
  r?: number;
  s?: number;
  tHeight?: number;
  stAmp?: number;
  stOffset?: number;
  mgnfy?: number;
  samplingRate?: number;
}): number[] {
  const waveform: number[] = [];
  const dt = 1 / samplingRate;

  // QT時間（QTc補正）※最低限の生理値に補正
  let qt = hr > 50 ? 0.35 * Math.pow(60 / hr, 0.75) : 0.4;
  if (sinusStatus === "Af") qt *= 0.85;

  // QRS duration（QRS幅）
  let qrsDur = hr > 150 ? 0.09 : hr > 120 ? 0.1 : hr > 90 ? 0.11 : 0.12;

  // 各波の中心時刻（秒）
  let mu_q = qrsDur / 8;
  let mu_r = mu_q + qrsDur / 6;
  let mu_s = mu_r + qrsDur / 6;

  // 各波の幅（標準偏差）
  let sigma_q = qrsDur / 18;
  let sigma_r = 0.015;
  let sigma_s = qrsDur / 18;

  // 完全右脚ブロック（RBBB）の場合：S波が遅れる
  if (ventStatus === "RBBB") {
    qrsDur = 0.14;
    mu_s = 0.12;
    sigma_s = qrsDur / 6;
  }

  // T波の中心と幅（QT時間+オフセット）
  const mu_t = qt + stOffset;
  const sigma_t = qt / 5;
  const sigma_t_right = qt / 8;

  // 合成長：T波の後ろも少し余裕を持たせる
  const n = Math.floor((mu_t + 0.4) * samplingRate);

  for (let i = 0; i < n; i++) {
    const t = i * dt;

    // QRS複合体（3成分の合成）
    const qrs = q * Math.exp(-((t - mu_q) ** 2) / (2 * sigma_q ** 2)) +
                r * Math.exp(-((t - mu_r) ** 2) / (2 * sigma_r ** 2)) +
                s * Math.exp(-((t - mu_s) ** 2) / (2 * sigma_s ** 2));

    // STセグメント（R〜Tまでを平坦に近く）
    let st = 0;
    if (t >= mu_r && t <= mu_t) {
      st = stAmp;
    }

    // T波（左緩やか・右やや急峻な非対称ガウス）
    const twave = t <= mu_t
      ? tHeight * Math.exp(-((t - mu_t) ** 2) / (2 * sigma_t ** 2))
      : tHeight * Math.exp(-((t - mu_t) ** 2) / (2 * sigma_t_right ** 2));

    // 合成して倍率適用＋小数第2位で丸め
    const y = (qrs + st + twave) * mgnfy;
    waveform.push(Math.round(y * 100) / 100);
  }

  return waveform;
}
