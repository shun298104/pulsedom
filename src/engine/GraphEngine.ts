// src/engine/GraphEngine.ts

import { SimOptions } from '../types/SimOptions';
import { Path } from './graphs/Path';
import { defaultNodes } from './graphs/nodes';
import { createDefaultPaths } from './graphs/paths';
import { LeadName } from '../constants/leadVectors';
import { Node, NodeId } from '../types/NodeTypes';
import { updateGraphEngineFromSim } from './UpdateGraph';

export class GraphEngine {
  private debugLevel: 0 | 1 | 2 = 0;
  private debugResetTimer: number | null = null;

  private nodes: Record<NodeId, Node>;
  private paths: Path[];
  private scheduledFires: { target: NodeId; via: string; fireAt: number }[] = [];

  constructor(nodes: Node[], pathsRaw: Path[], debugLevel: 0 | 1 | 2 = 0) {
    this.debugLevel = debugLevel;
    this.nodes = nodes.reduce((acc, n) => {
      acc[n.id] = n;
      return acc;
    }, {} as Record<NodeId, Node>);

    this.paths = pathsRaw.map(p => new Path(p, this.nodes));
  }

  private log(level: number, message: string, now: number) {
    if (this.debugLevel && level <= this.debugLevel) {
      console.log(`[${now.toFixed(0)}] ${message}`);
    }
  }

  public setDebugLevel(lvl: 0 | 1 | 2, autoResetMs?: number) {
    this.debugLevel = lvl;
    if (this.debugResetTimer !== null) {
      clearTimeout(this.debugResetTimer);
      this.debugResetTimer = null;
    }
    if (lvl > 0 && autoResetMs) {
      this.debugResetTimer = window.setTimeout(() => {
        this.debugLevel = 0;
        console.log('🔕 [GE] debugLevel auto-reset to 0');
      }, autoResetMs);
    }
  }

  /* Update the graph engine with new simulation options */
  updateFromSim(simOptions: SimOptions) {
    // 1. rate を直接反映
    const nodeIds: NodeId[] = ['SA', 'NH', 'V'];
    nodeIds.forEach((id) => {
      this.setNodeRate(id, simOptions.getRate(id));
    });

    updateGraphEngineFromSim(simOptions, this.nodes, this.paths);
  }

  private setNodeRate(nodeId: NodeId, bpm: number) {
    if (this.nodes[nodeId]) {
      this.nodes[nodeId].bpm = bpm;
    }
  }
  getLastFireTime(nodeId: NodeId): number {
    return this.nodes[nodeId]?.lastFiredAt ?? -1;
  }

  getAllPaths(): Path[] {
    return this.paths;
  }

  public sumPathVoltages(nowMs: number, lead: LeadName = 'II'): number {
    return this.paths.reduce((sum, path) => sum + path.getVoltage(nowMs, lead), 0);
  }

  public getLastConductedAt(pathId: string): number {
    const path = this.paths.find(p => p.id === pathId);
    return path?.lastConductedAt ?? -1;
  }

  private updateAdaptiveRefractory(node: Node, now: number) {
    const interval = now - node.lastFiredAt;
    const scale = Math.min(1.0, interval / 1000);
    node.adaptiveRefractoryMs = node.primaryRefractoryMs * scale;
  }

  tick(now: number): string[] {
    const firingEvent: string[] = [];

    for (const node of Object.values(this.nodes)) {
      if (!node.shouldAutoFire(now, this.estimateHR(now))) continue;

      this.updateAdaptiveRefractory(node, now);
      node.lastFiredAt = now;
      firingEvent.push(node.id);
      this.log(1, `⚡ ${node.id} Auto firing (${node.bpm}bpm)`, now);
      this.scheduleConduction(node.id, now);
    }

    const remaining: typeof this.scheduledFires = [];
    for (const sched of this.scheduledFires) {
      if (sched.fireAt > now) {
        remaining.push(sched);
        continue;
      }

      const target = this.nodes[sched.target];
      const viaPath = this.paths.find(p => p.id === sched.via);

      if (now - target.lastFiredAt >= target.getRefractoryMs(now)) {
        this.updateAdaptiveRefractory(target, now);
        target.lastFiredAt = now;
        firingEvent.push(target.id);
        if (viaPath) firingEvent.push(viaPath.id);
        this.log(1, `🔥 ${target.id} Scheduled firing via ${sched.via}`, now);
        this.scheduleConduction(target.id, now);
      } else {
        this.log(2, `⛔ node ${target.id} is refractory (${Math.round(now - target.lastFiredAt)} < ${target.getRefractoryMs(now)} ms)`, now);
      }
    }

    this.scheduledFires = remaining;
    return firingEvent;
  }

  private scheduleConduction(from: NodeId, now: number) {
    const outgoing = this.paths.filter(p => p.from === from);

    for (const path of outgoing) {
      if (!path.canConduct(now, this.paths)) {
        this.log(2, `🚫 ${path.id} blocked or refractory`, now);
        continue;
      }

      const fireAt = now + path.getDelay();
      const alreadyScheduled = this.scheduledFires.some(
        f => f.via === path.id && f.fireAt === fireAt
      );

      if (alreadyScheduled) {
        this.log(2, `↩️ duplicate schedule skipped for ${path.id}`, now);
        continue;
      }

      this.scheduledFires.push({ target: path.to, via: path.id, fireAt });
      path.lastConductedAt = now;
      this.log(2, `📨 (${path.id}) scheduled at ${Math.round(fireAt)}`, now);
    }
  }

  private estimateHR(now: number): number {
    const sa = this.nodes['SA'];
    const last = sa.lastFiredAt;
    const interval = now - last;
    return interval > 0 ? 60000 / interval : 80;
  }

  static createDefaultEngine(debugLevel: 0 | 1 | 2 = 0): GraphEngine {
    return new GraphEngine(defaultNodes, createDefaultPaths(), debugLevel);
  }
}

export type { Node };