import { Node } from '../GraphEngine';
import { vec3, type vec3 as Vec3 } from 'gl-matrix';
import { LeadName, leadVectors } from '../../constants/leadVectors';
import type { NodeId } from '../../types/NodeTypes';

export type PathProps = {
  id: string;
  from: NodeId;
  to: NodeId;
  amplitude: number;
  delayMs: number;
  apdMs: number;
  refractoryMs: number;
  conductionDirection?: 'forward' | 'retro';
  reversePathId?: string | null;
  blocked?: boolean;
  conductionProbability?: number;  // 0.0–1.0 省略時=1.0
  delayJitterMs?: number;          // ±jitter (ms)
};

export class Path {
  readonly id: string;
  readonly from: NodeId;
  readonly to: NodeId;
  readonly conductionDirection: 'forward' | 'retro';
  readonly reversePathId: string | null;

  blocked: boolean;
  lastConductedAt = -1000;
  vector: Vec3;

  amplitude: number;
  delayMs: number;
  delayJitterMs?: number;
  apdMs: number;
  refractoryMs: number;
  conductionProbability?: number;

  
  constructor(props: PathProps, nodeMap: Record<NodeId, Node>) {
    this.id = props.id;
    this.from = props.from;
    this.to = props.to;
    this.delayMs = props.delayMs;
    this.delayJitterMs = props.delayJitterMs;
    this.refractoryMs = props.refractoryMs;
    this.amplitude = props.amplitude;
    this.apdMs = props.apdMs;
    this.conductionDirection = props.conductionDirection ?? 'forward';
    this.reversePathId = props.reversePathId ?? null;
    this.blocked = props.blocked ?? false;
    this.conductionProbability = props.conductionProbability ?? undefined;

    const fromNode = nodeMap[this.from];
    const toNode = nodeMap[this.to];
    this.vector = vec3.fromValues(toNode.x - fromNode.x, toNode.y - fromNode.y, toNode.z - fromNode.z);
  }

  /** conduction delay with optional jitter */
  getDelay(): number {
    if (this.delayJitterMs === undefined) return this.delayMs;
    const jitter = (Math.random() * 2 - 1) * this.delayJitterMs; // ±jitter
    return Math.max(0, this.delayMs + jitter);
  }

  /** return true if conduction allowed at `now` */
  canConduct(now: number, allPaths: Path[]): boolean {
    if (this.blocked) return false;

    // refractory check for self
    if (now - this.lastConductedAt < this.refractoryMs) return false;

    // reverse path refractory interaction
    if (this.reversePathId) {
      const reverse = allPaths.find(p => p.id === this.reversePathId);
      if (reverse) {
        const sinceReverse = now - reverse.lastConductedAt;
        const threshold = reverse.refractoryMs * (reverse.lastConductedAt > this.lastConductedAt ? 1.5 : 1.0);
        if (sinceReverse < threshold) return false;
      }
    }

    // probabilistic conduction
    if (this.conductionProbability !== undefined && Math.random() > this.conductionProbability) {
      console.log(`💰 Path ${this.id} conduction blocked by probability (${this.conductionProbability})`);
      return false;
    }

    return true;
  }

  getVoltage(now: number, lead: LeadName): number {
    const t = (now - this.lastConductedAt) / 1000;
    const μ1 = this.delayMs / 1000;                    // 脱分極中心
    const μ2 = (this.delayMs + this.apdMs) / 1000;     // 再分極中心（T波中心）
  
    const σ1 = 0.02;  // 脱分極のシャープさ（QRS）
    const σL = 0.04;  // T波左側の幅（ゆるやか）
    const σR = 0.025; // T波右側の幅（鋭く）
  
    const G1 = Math.exp(-Math.pow((t - μ1) / σ1, 2));
  
    // 左右非対称ガウス：μ2を中心に左右でσを変える
    const σ2 = t <= μ2 ? σL : σR;
    const G2 = -0.4 * Math.exp(-Math.pow((t - μ2) / σ2, 2));
  
    const baseWave = G1 - G2;
  
    const unitVector = vec3.normalize(vec3.create(), this.vector);
    const polarity = vec3.dot(unitVector, leadVectors[lead]);
  
    return this.amplitude * baseWave * polarity;
  }  
  
  isVentricular(): boolean {
    return this.to === 'V';
  }

  getId(): string {
    return this.id;
  }
  
}
function asymmetricGaussian(t: number, mu: number, sigmaL: number, sigmaR: number): number {
  const sigma = t <= mu ? sigmaL : sigmaR;
  return Math.exp(-Math.pow(t - mu, 2) / (2 * Math.pow(sigma, 2)));
}
export type PathId = string;