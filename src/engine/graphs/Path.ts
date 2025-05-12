// src/engine/graphs/Path.ts
import { Node } from '../GraphEngine';
import { vec3, type vec3 as Vec3 } from 'gl-matrix';
import { LeadName } from '../../constants/leadVectors';
import type { NodeId } from '../../types/NodeTypes';
import { calculateDotFactors } from '../../utils/calculateDotFactors';

export type PathProps = {
  id: string;
  from: NodeId;
  to: NodeId;
  amplitude: number;
  delayMs: number;
  apdMs: number;
  refractoryMs: number;
  polarity?: number;
  conductionDirection?: 'forward' | 'retro';
  reversePathId?: string | null;
  blocked?: boolean;
  conductionProbability?: number;
  delayJitterMs?: number;
};

const reversePaths = new WeakMap<Path, Path>();

export class Path {
  private reversePath?: Path;
  private computeBaseWave!: (t: number) => number;

  readonly reversePathId?: string | null;
  readonly id: string;
  readonly from: NodeId;
  readonly to: NodeId;
  amplitude: number;
  delayMs: number;
  refractoryMs: number;
  blocked: boolean;
  polarity?: number;

  lastConductedAt = -1000;
  delayJitterMs?: number;
  apdMs: number;
  conductionProbability?: number;

  vector: Vec3;
  dotFactors: Record<LeadName, number>; // 修正

  constructor(props: PathProps, nodeMap: Record<NodeId, Node>, allPaths: Path[]) {
    this.id = props.id;
    this.from = props.from;
    this.to = props.to;
    this.amplitude = props.amplitude;
    this.delayMs = props.delayMs;
    this.refractoryMs = props.refractoryMs;
    this.blocked = props.blocked ?? false;
    this.reversePathId = props.reversePathId ?? null;
    this.polarity = props.polarity ?? 0.1;
    this.delayJitterMs = props.delayJitterMs;
    this.apdMs = props.apdMs;
    this.conductionProbability = props.conductionProbability ?? undefined;

    // ノード間のベクトル計算
    const fromNode = nodeMap[this.from];
    const toNode = nodeMap[this.to];
    this.vector = vec3.fromValues(
      toNode.x - fromNode.x,
      toNode.y - fromNode.y,
      toNode.z - fromNode.z
    );

    // DotFactorの計算とキャッシュ
    this.dotFactors = calculateDotFactors(this, fromNode, toNode);
    this.updateParams(this.delayMs, this.apdMs, this.polarity);
  }

  /** パラメータ更新時にベース波形を再定義 */
  public updateParams(delayMs: number, apdMs: number, polarity: number) {
    this.delayMs = delayMs;
    this.apdMs = apdMs;
    this.polarity = polarity;

    const μ1 = this.delayMs / 1000;
    const μ2 = (this.delayMs + this.apdMs) / 1000;
    const sigma1 = 0.02;
    const sigmaL = 0.06;
    const sigmaR = 0.04;
    const gain = 0.4;
    const amplitude = this.amplitude;

    // クロージャ再定義（getVoltageと同じアルゴリズム）
    this.computeBaseWave = (t: number) => {
      const nowS = (t - this.lastConductedAt) / 1000;
      const G1 = Math.exp(-Math.pow((nowS - μ1) / sigma1, 2));
      const sigma2 = nowS <= μ2 ? sigmaL : sigmaR;
      const G2 = -Math.exp(-Math.pow((nowS - μ2) / sigma2, 2)) * (this.polarity ?? 0.1);
      const baseWave = G1 + G2;

      return baseWave * gain * amplitude;
    };
  }

  /** ベース波形計算 */
  public getBaseWave(t: number): number {
    if (!this.computeBaseWave) {
      console.error(`computeBaseWave is not defined for Path ${this.id}`);
      return 0;
    }
    return this.computeBaseWave(t);
  }

  getReversePath(): Path | undefined {
    return reversePaths.get(this);
  }

  setReversePath(reversePath: Path) {
    this.reversePath = reversePath;
  }

  canConduct(now: number): boolean {
    if (this.blocked) return false;
    if (now - this.lastConductedAt < this.refractoryMs) return false;

    if (this.conductionProbability !== undefined) {
      const randomValue = Math.random();
      if (randomValue > this.conductionProbability) return false;
    }

    if (this.reversePath) {
      const sinceReverse = now - this.reversePath.lastConductedAt;
      const threshold = this.reversePath.refractoryMs * (this.reversePath.lastConductedAt > this.lastConductedAt ? 1.5 : 1.0);
      if (sinceReverse < threshold) return false;
    }
    return true;
  }

  /** conduction delay with optional jitter */
  getDelay(): number {
    if (this.delayJitterMs === undefined) return this.delayMs;
    const jitter = (Math.random() * 2 - 1) * this.delayJitterMs; // ±jitter
    return Math.max(0, this.delayMs + jitter);
  }

  /** DotFactorの取得 */
  getDotFactor(leadName: LeadName): number {
    return this.dotFactors[leadName] ?? 0;
  }

  /** 電位計算（全リード一括） */
  public getVoltages(now: number): Record<LeadName, number> {
    const baseWave = this.getBaseWave(now);
    //    console.log('Base Wave:', this.id, baseWave); // デバッグ用
    const voltages: Record<LeadName, number> = {} as Record<LeadName, number>;

    for (const lead in this.dotFactors) {
      voltages[lead as LeadName] = baseWave * this.dotFactors[lead as LeadName];
    }
    return voltages;
  }

  isVentricular(): boolean {
    return this.to === 'V';
  }

  getId(): string {
    return this.id;
  }
}

export type PathId = string;
export { reversePaths };
