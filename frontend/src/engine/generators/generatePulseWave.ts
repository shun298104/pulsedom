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
  const dt = params.dt ?? 1;        // 刻み幅 [ms]
  const rr = params.rr;
  const r = params.r;
  const c = params.c;
  const sv = params.sv;
  const sd = params.sd;

  // Qin（収縮期流入）: 論文sin型, それ以外は0
  // t[ms]→[s]換算
  const qin = (t: number) =>
    (t >= 0 && t < sd)
      ? (Math.PI * sv) / (2 * sd / 1000) * Math.sin(Math.PI * t / sd)
      : 0; // [mL/s]

  // 逐次積分（イーラー法、dt刻みで0～rrまでP配列を作る）
  const steps = Math.ceil(rr / dt);
  const P: number[] = [0];
  for (let i = 1; i <= steps; ++i) {
    const t = i * dt;
    const prevP = P[i - 1];
    const Qin = qin(t);
    const dP = ((Qin - prevP / r) / c) * (dt / 1000); // [mmHg], dt[s]換算
    P.push(prevP + dP);
  }

  // 波形関数として返す（t[ms]でサンプル）
  return function (t: number): number {
    if (t < 0 || t >= rr) return 0;
    const idx = Math.floor(t / dt);
    return P[idx] ?? 0;
  };
}
