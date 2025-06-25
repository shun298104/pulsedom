// src/engine/generators/generateEtco2Wave.ts

export type Etco2Params = {
    respRate: number;              // 呼吸数 [breaths/min]
    etco2: number;                 // 終末CO2値（III相の終了値）[mmHg]
    iiEndValue: number;            // II相の終了値＝III相の開始値 [mmHg]
    riseSharpness?: number;        // II相の立ち上がり鋭さ（sinの指数）
    dt?: number;                   // 刻み幅 [ms]
    durationMs?: number;           // 波形1周期の長さ（省略時は respRate から計算）
    fallSharpness?: number;        // IV相（降下部）の鋭さ（cosの指数/オプション）
    fallExpSteps?: number;         // IV相の最後をexp型にするstep数
    fallExpAlpha?: number;         // exp降下の鋭さパラメータ
};

/**
 * ETCO2波形生成
 * IV相(fall)の最後数stepだけ指数関数型で急降下
 */
export function generateEtco2Wave(params: Etco2Params): (t: number) => number {
    const {
        respRate,
        etco2,
        iiEndValue,
        riseSharpness = 1.7,
        fallSharpness = 1.3, // 使わない場合もあり
        dt = 10,
        durationMs = 60000 / respRate,
        fallExpSteps = 8,        // 最後のexpステップ数（調整可）
        fallExpAlpha = 2.5,      // exp降下鋭さ（調整可）
    } = params;

    const steps = Math.floor(durationMs / dt);

    const waveform: number[] = new Array(steps);

    const riseEnd = Math.floor(0.1 * steps);
    const plateauEnd = riseEnd + Math.floor(0.4 * steps);
    const fallEnd = plateauEnd + Math.floor(0.075 * steps);

    for (let i = 0; i < steps; ++i) {
        if (i < riseEnd) {
            // II相: sin型で立ち上げ
            const x = i / riseEnd;
            waveform[i] = iiEndValue * Math.pow(Math.sin(Math.PI * x / 2), riseSharpness);
        } else if (i < plateauEnd) {
            // III相: smoothstep
            const x = (i - riseEnd) / (plateauEnd - riseEnd);
            const s = 3 * x * x - 2 * x * x * x;
            waveform[i] = iiEndValue + (etco2 - iiEndValue) * s;
        } else if (i < fallEnd - fallExpSteps) {
            // IV相（降下前半）: cos型でなめらか降下
            const x = (i - plateauEnd) / (fallEnd - fallExpSteps - plateauEnd);
            waveform[i] = etco2 * Math.pow(Math.cos(Math.PI * x / 2), fallSharpness);
        } else if (i < fallEnd) {
            // IV相（降下最後数step）: exp型で急降下
            const idxExp = i - (fallEnd - fallExpSteps);        // 0,1,2,...
            const startValue = waveform[fallEnd - fallExpSteps - 1] ?? etco2 * 0.2;
            const x = idxExp / (fallExpSteps - 1);              // 0〜1
            // exp(-alpha * x)で強制的に0近くまで落とす
            waveform[i] = startValue * Math.exp(-fallExpAlpha * x);
        } else {
            // 吸気基線（0相）
            waveform[i] = 0;
        }
    }

    return function (t: number): number {
        if (t < 0 || t >= durationMs) return 0;
        const idx = Math.floor(t / dt);
        return waveform[idx] ?? 0;
    };
}
