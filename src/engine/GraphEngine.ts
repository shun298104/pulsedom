// src/engine/GraphEngine.ts
import { SimOptions } from '../types/SimOptions';
import { Path } from './graphs/Path';
import { defaultNodes } from './graphs/nodes';
import { createDefaultPaths } from './graphs/paths';
import { Node, NodeId } from '../types/NodeTypes';
import { updateGraphEngineFromSim } from './GraphControl';

export class GraphEngine {
  private debugLevel: 0 | 1 | 2 = 0;
  private debugResetTimer: number | null = null;
  private nodes: Record<NodeId, Node>;
  private paths: Path[];
  private toNodesCache: Record<NodeId, Path[]> = {} as Record<NodeId, Path[]>;

  private reversePathIndex = new Map<Path, Path>();
  private scheduledFires: { target: NodeId; via: string; fireAt: number }[] = [];


  constructor(nodes: Node[], pathsRaw: Path[], debugLevel: 0 | 1 | 2 = 0) {
    this.debugLevel = debugLevel;
    this.nodes = nodes.reduce((acc, n) => {
      acc[n.id] = n;
      return acc;
    }, {} as Record<NodeId, Node>);

    this.paths = pathsRaw.map(p => new Path(p, this.nodes, pathsRaw)); 
    this.cacheOutgoingPaths();
    this.linkReversePaths(); // リバースパスの設定
  }

  private cacheOutgoingPaths() {
    for (const path of this.paths) {
      const { from } = path;
      if (!this.toNodesCache[from]) {
        this.toNodesCache[from] = [];
      }
      this.toNodesCache[from].push(path);
    }
  }

  public toNodes(from: NodeId): Path[] {
    return this.toNodesCache[from] || [];
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
    const nodeIds: NodeId[] = ['SA', 'NH', 'RV'];
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
    return this.nodes[nodeId]?.STATE.lastFiredAt ?? -1;
  }

  getPaths(): Path[] {
    return this.paths;
  }

  public getLastConductedAt(pathId: string): number {
    const path = this.paths.find(p => p.id === pathId);
    return path?.lastConductedAt ?? -1;
  }

  private updateAdaptiveRefractory(node: Node, now: number) {
    const interval = now - node.STATE.lastFiredAt;
    const scale = Math.min(1.0, interval / 1000);
    node.adaptiveRefractoryMs = node.primaryRefractoryMs * scale;
  }

  tick(now: number): string[] {
    const firingEvent: string[] = []; //tick()の戻り値をREに返す

    const autofiringNodes = Object.values(this.nodes)
      .filter(p => p.CONFIG?.autoFire === true || p?.CONFIG.forceFiring === true)
      .map(p => p.id);

    for (const nodeId of autofiringNodes) {
      const node = this.nodes[nodeId];
      if (!node) continue; // ノードが存在しない場合のガード

      if (!node.shouldAutoFire(now)) continue;
      this.updateAdaptiveRefractory(node, now);
      node.STATE.lastFiredAt = now;
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

      if (now - target.STATE.lastFiredAt >= target.getRefractoryMs(now)) {
        this.updateAdaptiveRefractory(target, now);
        target.STATE.lastFiredAt = now;
        firingEvent.push(target.id);
        if (viaPath) firingEvent.push(viaPath.id);
        this.log(1, `🔥 ${target.id} Scheduled firing via ${sched.via}`, now);
        this.scheduleConduction(target.id, now);
      } else {
        this.log(2, `⛔ node ${target.id} is refractory (${Math.round(now - target.STATE.lastFiredAt)} < ${target.getRefractoryMs(now)} ms)`, now);
      }
    }
    this.scheduledFires = remaining;
    return firingEvent;
  }

  private scheduleConduction(from: NodeId, now: number) {
    const outgoing = this.toNodesCache[from] || [];

    for (const path of outgoing) {
      if (path.blocked) { continue; }
      if (!path.canConduct(now)) {
        this.log(2, `🚫 ${path.id} is refractory`, now);
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

  private linkReversePaths() {
    this.paths.forEach(path => {
      if (path.reversePathId) {
        const reverse = this.paths.find(p => p.id === path.reversePathId);
        if (reverse) {
          path.setReversePath(reverse);
          reverse.setReversePath(path);
          this.reversePathIndex.set(path, reverse);
          this.reversePathIndex.set(reverse, path);
        }
      }
    });
  }

  getReversePath(path: Path): Path | undefined {
    return this.reversePathIndex.get(path);
  }

  static createDefaultEngine(debugLevel: 0 | 1 | 2 = 0): GraphEngine {
    return new GraphEngine(defaultNodes, createDefaultPaths(), debugLevel);
  }
}

export type { Node };