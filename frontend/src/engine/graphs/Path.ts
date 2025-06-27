// src/engine/graphs/Path.ts
import { Node } from '../GraphEngine';
import { vec3, type vec3 as Vec3 } from 'gl-matrix';
import { LeadName } from '../../constants/leadVectors';
import { calculateDotFactors } from '../../utils/calculateDotFactors';
import type { NodeId } from '../../types/NodeTypes';

export type PathConfig = {
  delayMs: number;
  refractoryMs: number;
  apdMs: number;
  amplitude: number;
  polarity: number;
  priority?: number;
  blocked?: boolean;
  conductionProbability?: number;
  delayJitterMs?: number;
  decrementalStep?: number;
  wenckebachPhenomenon?: boolean;
};

export type PathState = {
  lastConductedAt: number;
  absoluteRefractoryUntil: number;
  decrementalMs: number;
  pending?: boolean;
};

export type PathProps = {
  id: string;
  from: NodeId;
  to: NodeId;
  reversePathId?: string | null;
  config?: Partial<PathConfig>;
  state?: Partial<PathState>;
};

const reversePaths = new WeakMap<Path, Path>();

export class Path {
  // === 基本属性（恒久・直下） ===
  readonly id: string;
  readonly from: NodeId;
  readonly to: NodeId;
  readonly reversePathId?: string | null;

  // === CONFIG ===
  CONFIG: PathConfig;

  // === STATE ===
  STATE: PathState;

  // === 内部キャッシュ・計算用 ===
  private reversePath?: Path;
  private computeBaseWave!: (t: number, rr: number) => number;
  vector: Vec3;
  dotFactors: Record<LeadName, number>;

  constructor(props: PathProps, nodeMap: Record<NodeId, Node>) {
    this.id = props.id;
    this.from = props.from;
    this.to = props.to;
    this.reversePathId = props.reversePathId ?? null;

    // CONFIG初期化
    this.CONFIG = {
      delayMs: 0,
      refractoryMs: 0,
      apdMs: 0,
      amplitude: 1,
      polarity: 0.1,
      priority: 1,
      blocked: false,
      conductionProbability: undefined,
      delayJitterMs: undefined,
      decrementalStep: 0,
      wenckebachPhenomenon: false,
      ...(props.config ?? {})
    };

    // STATE初期化
    this.STATE = {
      lastConductedAt: -1000,
      absoluteRefractoryUntil: 0,
      decrementalMs: 0,
      ...(props.state ?? {})
    };

    // ノード間のベクトル計算
    const fromNode = nodeMap[this.from];
    const toNode = nodeMap[this.to];
    this.vector = vec3.fromValues(
      toNode.x - fromNode.x,
      toNode.y - fromNode.y,
      toNode.z - fromNode.z
    );
    this.dotFactors = calculateDotFactors(fromNode, toNode);

    this.updateParams(
      this.CONFIG.delayMs,
      this.CONFIG.apdMs,
      this.CONFIG.polarity
    );
  }

  // ========== setter ==========

  setConfig(newConfig: Partial<PathConfig>) {
    Object.assign(this.CONFIG, newConfig);
    this.updateParams(
      this.CONFIG.delayMs,
      this.CONFIG.apdMs,
      this.CONFIG.polarity
    );
  }

  setState(newState: Partial<PathState>) {
    Object.assign(this.STATE, newState);
  }

  // ========== パラメータ更新・計算系 ==========

  public updateParams(delayMs: number, apdMs: number, polarity: number) {
    this.CONFIG.delayMs = delayMs;
    this.CONFIG.apdMs = apdMs;
    this.CONFIG.polarity = polarity;

    const μ1 = this.CONFIG.delayMs / 1000;
    const sigma1 = 0.02;
    const gain = 0.4;
    const amplitude = this.CONFIG.amplitude;

    this.computeBaseWave = (t: number, rr: number) => {
      const nowS = (t - this.STATE.lastConductedAt) / 1000;
      const G1 = Math.exp(-Math.pow((nowS - μ1) / sigma1, 2));

      const rrFactor = Math.max(0.5, Math.min(1.5, Math.sqrt(rr / 1000)));
      const μ2 = μ1 + (this.CONFIG.apdMs / 1000) * rrFactor;
      const sigmaL = 0.07 * rrFactor;
      const sigmaR = 0.04 * rrFactor;
      const sigma2 = nowS <= μ2 ? sigmaL : sigmaR;
      const G2 = -Math.exp(-Math.pow((nowS - μ2) / sigma2, 2)) * (this.CONFIG.polarity ?? 0.1);
      const baseWave = G1 + G2;

      return baseWave * gain * amplitude;
    };
  }

  // ========== その他メソッド ==========

  getReversePath(): Path | undefined {
    return reversePaths.get(this);
  }

  setReversePath(reversePath: Path) {
    this.reversePath = reversePath;
  }

  canConduct(now: number): boolean {
    if (this.CONFIG.blocked) return false;
    if (now - this.STATE.lastConductedAt < this.CONFIG.refractoryMs) return false;
    if (now < this.STATE.absoluteRefractoryUntil) return false;

    if (this.CONFIG.conductionProbability !== undefined) {
      const randomValue = Math.random();
      if (randomValue > this.CONFIG.conductionProbability) {
        console.log(`>>Path ${this.id} conduction blocked by probability (${randomValue} > ${this.CONFIG.conductionProbability})`);
        return false;
      }
    }

    if (this.reversePath) {
      const sinceReverse = now - this.reversePath.STATE.lastConductedAt;
      const threshold = this.reversePath.CONFIG.refractoryMs * (this.reversePath.STATE.lastConductedAt > this.STATE.lastConductedAt ? 1.5 : 1.0);
      if (sinceReverse < threshold) return false;
    }

    if (this.CONFIG.decrementalStep) {
      if (now - this.STATE.lastConductedAt - this.STATE.decrementalMs * 3 < this.CONFIG.refractoryMs) {
        console.log(`>>Path ${this.id} conduction blocked by Fatigue. ${this.STATE.decrementalMs}`)
        this.STATE.decrementalMs = 0;
        return false;
      }
    }
    return true;
  }

  getCurrentDelayMs(): number {
    if (this.CONFIG.wenckebachPhenomenon) {
      console.log(`[path.ts] ${this.id} has wenckenbach phenomenon. decMs is ${this.STATE.decrementalMs}.`)
      return this.CONFIG.delayMs + this.STATE.decrementalMs
    } else {
      return this.CONFIG.delayMs;
    }
  }

  conduct(fireAt: number) {
    const delay = this.getCurrentDelayMs();
    this.STATE.lastConductedAt = fireAt - delay;

    if (this.CONFIG.decrementalStep) {
      this.STATE.decrementalMs = (this.STATE.decrementalMs ?? 0) + this.CONFIG.decrementalStep;
    }
  }

  getDelay(): number {
    if (this.CONFIG.delayJitterMs === undefined) return this.CONFIG.delayMs;
    const jitter = (Math.random() * 2 - 1) * this.CONFIG.delayJitterMs;
    const totalDelay = this.CONFIG.delayMs + jitter + this.STATE.decrementalMs
    return Math.max(0, totalDelay);
  }

  getDotFactor(leadName: LeadName): number {
    return this.dotFactors[leadName] ?? 0;
  }

  public getBaseWave(t: number, rr: number): number {
    if (!this.computeBaseWave) {
      console.error(`[WRF] computeBaseWave is not defined for Path ${this.id}`);
      return 0;
    }
    return this.computeBaseWave(t, rr);
  }

  public getVoltages(now: number, rr: number): Record<LeadName, number> {
    const baseWave = this.getBaseWave(now, rr);
    const voltages: Record<LeadName, number> = {} as Record<LeadName, number>;

    for (const lead in this.dotFactors) {
      voltages[lead as LeadName] = baseWave * this.dotFactors[lead as LeadName];
    }
    return voltages;
  }

  // --- setter系 ---
  setDelay(delay: number) {
    this.setConfig({ delayMs: delay });
  }
  setAPD(apd: number) {
    this.setConfig({ apdMs: apd });
  }
  setRefractoryMs(refractoryMs: number) {
    this.setConfig({ refractoryMs });
    console.log(`[path.ts] ${this.id} set Refractory to ${this.CONFIG.refractoryMs}`)
  }
  setPolarity(polarity: number) {
    this.setConfig({ polarity });
  }
  setConductionProbability(probability: number) {
    this.setConfig({ conductionProbability: probability });
  }
  setAmplitude(amplitude: number) {
    this.setConfig({ amplitude });
  }
  setDecrementalStep(decStep: number){
    this.setConfig({ decrementalStep: decStep });
  }

  getId(): string {
    return this.id;
  }
}

export type PathId = string;
export { reversePaths };
