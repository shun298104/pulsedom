// src/engine/generators/generatePulseWave.ts

export type PulseWaveParams = {
  rr: number;    // RR間隔 [ms]
  r: number;     // 末梢抵抗 [mmHg/(mL/s)]
  c: number;     // コンプライアンス [mL/mmHg]
  sv: number;    // 1回拍出量 [mL]
  sd: number;    // 収縮期長 [ms]
  dt?: number;   // 刻み幅 [ms]（省略時1ms）
};

/**
 * Windkessel厳密モデル：論文sin型Qin逐次積分
 * https://www.jstage.jst.go.jp/article/maebit/22/0/22_75/_pdf/-char/ja?utm_source=chatgpt.com
 */
export function PulseWaveFn(params: PulseWaveParams): (t: number) => number {
  const dt = params.dt ?? 1;
  const rr = params.rr;
  const c = params.c;

  const rr_base = 750; // [ms]
  const sv_base = 70;  // [mL]
  const alpha = 0.5;   // for sv
  const beta = 0.3;    // ⬅️ 新規導入：RR依存でrを増やす指数

  const sv = sv_base * Math.pow(rr / rr_base, alpha);

  const r_base = params.r;
  const r = r_base * Math.pow(rr / rr_base, beta);  // ⬅️ ここ追加

  const baseSd = params.sd;
  const rrFactor = Math.max(0.8, Math.min(1.5, Math.sqrt(rr / 1000)));
  const sd = baseSd * rrFactor;

  const qin = (t: number) =>
    (t >= 0 && t < sd)
      ? (Math.PI * sv) / (2 * sd / 1000) * Math.pow(Math.sin(Math.PI * t / sd), 2)
      : 0;

  const steps = Math.ceil(rr / dt);
  const P: number[] = [0];
  for (let i = 1; i <= steps; ++i) {
    const t = i * dt;
    const prevP = P[i - 1];
    const Qin = qin(t);
    const dP = ((Qin - prevP / r) / c) * (dt / 1000);
    P.push(prevP + dP);
  }

  return function (t: number): number {
    if (t < 0 || t >= rr) return 0;
    const idx = Math.floor(t / dt);
    return P[idx] ?? 0;
  };
}
