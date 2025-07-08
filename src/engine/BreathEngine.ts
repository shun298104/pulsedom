import { generateEtco2Wave } from './generators/generateEtco2Wave';

export class BreathEngine {
    private respRate: number;             // 呼吸数 [breaths/min]
    private etco2: number;                // 終末CO2値 [mmHg]
    private durationMs: number;          // 呼吸周期長 [ms]
    private breathEndAtMs: number;       // 現在の呼吸周期の終了時刻 [ms]

    private currentWaveFn: (t: number) => number; // 現在の波形関数
    private nextWaveFn: ((t: number) => number) | null = null; // 次の波形関数
    private nextDurationMs: number | null = null; // 次周期のdurationMs

    private lastBreathStartAtMs: number; // 現在の呼吸周期の開始時刻[ms]

    constructor(params: { respRate: number; etco2: number }) {
        this.respRate = params.respRate;
        this.etco2 = params.etco2;
        this.durationMs = Math.max(60000 / this.respRate, 200);
        this.breathEndAtMs = this.durationMs;

        this.lastBreathStartAtMs = 0; // 開始時刻は0ms想定
        this.breathEndAtMs = this.lastBreathStartAtMs + this.durationMs;

        const iiEndValue = this.etco2 - 3;
        this.currentWaveFn = generateEtco2Wave({
            respRate: this.respRate,
            etco2: this.etco2,
            iiEndValue,
            durationMs: this.durationMs,
        });
    }

    /**
     * 現在時刻に応じたETCO2値を返す
     * @param tAbsMs シミュレーション絶対時間 [ms]
     */
    public getEtco2(tAbsMs: number): number {
        if (tAbsMs >= this.breathEndAtMs) {
            // ここでpending反映
            if (this.nextWaveFn && this.nextDurationMs !== null) {
                this.currentWaveFn = this.nextWaveFn;
                this.durationMs = this.nextDurationMs;
                this.nextWaveFn = null;
                this.nextDurationMs = null;
            }
            // 次周期へ進む
            // ※ tAbsMsがbreathEndAtMsより大きく進んでいたら追いつくまで進める（ロス回避）
            while (tAbsMs >= this.breathEndAtMs) {
                this.lastBreathStartAtMs = this.breathEndAtMs;
                this.breathEndAtMs = this.lastBreathStartAtMs + this.durationMs;
            }
        }
        const tResp = tAbsMs - this.lastBreathStartAtMs;
        return this.currentWaveFn(tResp);
    }


    /**
     * 呼吸設定の更新（次周期から反映）
     */
    public update(params: { respRate?: number; etco2?: number }) {
        if (params.respRate !== undefined) this.respRate = params.respRate;
        if (params.etco2 !== undefined) this.etco2 = params.etco2;

        this.nextDurationMs = Math.max(60000 / this.respRate, 200);
        const iiEndValue = this.etco2 - 3;

        this.nextWaveFn = generateEtco2Wave({
            respRate: this.respRate,
            etco2: this.etco2,
            iiEndValue,
            durationMs: this.nextDurationMs,
        });
    }
}
