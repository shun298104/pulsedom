//src/engine/GraphEngine.ts
import { Path } from './graphs/Path';
import { defaultNodes } from './graphs/nodes';
import { createDefaultPaths } from './graphs/paths';
import { Node, NodeId } from '../types/NodeTypes';
import type { PathProps } from './graphs/Path';

export class GraphEngine {
  private debugLevel: 0 | 1 | 2 | 3 = 0;
  private debugResetTimer: number | null = null;

  private pathMap: Record<string, Path> = {} as Record<string, Path>;
  private fromNodesCache: Record<NodeId, Path[]> = {} as Record<NodeId, Path[]>;
  private toNodesCache: Record<NodeId, Path[]> = {} as Record<NodeId, Path[]>;

  private reversePathIndex = new Map<Path, Path>();
  private scheduledFires: { target: NodeId; via: string; fireAt: number }[] = [];

  public nodes: Record<string, Node>;

  constructor(nodes: Node[], pathsRaw: PathProps[], debugLevel: 0 | 1 | 2 | 3 = 0) {
    this.debugLevel = debugLevel;
    this.nodes = Object.fromEntries(new Map(nodes.map(node => [node.id, node]))) as Record<NodeId, Node>;
    const pathInstances = pathsRaw.map(p => new Path(p, this.nodes));
    this.buildPathCacheAndLinks(pathInstances);
  }

  public getPaths(): Path[] { return Object.values(this.pathMap); }
  public getPath(pathId: string): Path | undefined { return this.pathMap[pathId]; }
  public getNode(id: string): Node | undefined { return this.nodes[id]; }

  private buildPathCacheAndLinks(paths: Path[]) {
    const pathMap: Record<string, Path> = {};
    for (const path of paths) {
      (this.fromNodesCache[path.from] ||= []).push(path);
      (this.toNodesCache[path.to] ||= []).push(path);
      pathMap[path.id] = path;
    }
    this.pathMap = pathMap;
    for (const path of paths) {
      if (path.reversePathId) {
        const reversePath = pathMap[path.reversePathId];
        if (reversePath) {
          path.setReversePath(reversePath);
          reversePath.setReversePath(path);
          this.reversePathIndex.set(path, reversePath);
          this.reversePathIndex.set(reversePath, path);
        }
      }
    }
  }

  public fromNodes(from: NodeId): Path[] {
    return this.fromNodesCache[from] || [];
  }
  public toNodes(to: NodeId): Path[] {
    return this.toNodesCache[to] || [];
  }

  private log(level: number, message: string, now: number) {
    if (this.debugLevel <= 2 && (message.includes('LA') || message.includes('LBB') || message.includes('RV') || message.includes('LV') || message.includes('BM') || message.includes('AN'))) return;
    if (this.debugLevel >= level) {
      console.log(`[${Math.round(now)}] ${message}`);
    }
  }

  public setDebugLevel(lvl: 0 | 1 | 2 | 3, autoResetMs?: number) {
    this.debugLevel = lvl;
    if (this.debugResetTimer !== null) clearTimeout(this.debugResetTimer);
    if (lvl > 0 && autoResetMs) {
      this.debugResetTimer = window.setTimeout(() => {
        this.debugLevel = 0;
        console.log('🔕 [GE] debugLevel auto-reset to 0');
      }, autoResetMs);
    }
  }

  getLastFireTime(nodeId: NodeId): number {
    return this.nodes[nodeId]?.STATE.lastFiredAt ?? -1;
  }

  // strict: Pathの可変パラメータもCONFIG経由でのみ更新
  public setPathCustomParams(pathId: string, params: { delayMs?: number; amplitude?: number; polarity?: number }) {
    const path = this.getPath(pathId);
    if (path) {
      if (params.delayMs !== undefined) path.CONFIG.delayMs = params.delayMs;
      if (params.amplitude !== undefined) path.CONFIG.amplitude = params.amplitude;
      if (params.polarity !== undefined) path.CONFIG.polarity = params.polarity;
      // 必要なら path.updateParams() も呼ぶ（記録に準じて実装）
      if (path.updateParams) path.updateParams(path.CONFIG.delayMs, path.CONFIG.apdMs, path.CONFIG.polarity);
    }
  }

  public getLastConductedAt(pathId: string): number {
    return this.getPath(pathId)?.STATE?.lastConductedAt ?? -1;
  }

  private scheduleConduction(from: NodeId, now: number) {
    const outgoingPaths = this.fromNodes(from);

    for (const path of outgoingPaths) {
      if (path.CONFIG.blocked) {
        this.log(2, `  📨⛔ ${path.id} is blocked`, now);
        continue;
      }
      if (!path.canConduct(now)) {
        this.log(2, `  📨⛔ ${path.id} cannot conduct now`, now);
        continue;
      }

      const fireAt = now + path.getCurrentDelayMs();
      path.STATE.absoluteRefractoryUntil = now + path.CONFIG.refractoryMs;

      const alreadyScheduled = this.scheduledFires.some(f => f.via === path.id);
      if (alreadyScheduled) continue;
      this.log(1, `📨 Scheduling ${path.id}: now=${now.toFixed(0)} → fireAt=${fireAt.toFixed(0)} (delay=${((fireAt - now).toFixed(0))})`, now);

      this.scheduledFires.push({ target: path.to, via: path.id, fireAt });
      this.log(2, `  📨 (${path.id}) scheduled at ${Math.round(fireAt)}, but NOT fired yet.`, now);
      this.log(3, `[scheduledFires was pushed!]  ${JSON.stringify(this.scheduledFires)}`, now)
    }
  }

  tick(now: number): string[] {
    if (this.scheduledFires.length > 0) this.log(3, `[TICK] scheduledFires: ${JSON.stringify(this.scheduledFires)}`, now);
    const firingEvents: string[] = [];

    for (const node of Object.values(this.nodes)) {
      if (node.CONFIG?.autoFire || node.CONFIG?.forceFiring) {
        if (node.shouldAutoFire(now)) {
          node.STATE.lastFiredAt = now;
          node.setNextFiringAt(now);
          firingEvents.push(node.id);
          this.log(1, `⚡⚡⚡ ${node.id} Auto firing (${node.bpm}bpm) ⚡⚡⚡`, now);
          this.scheduleConduction(node.id, now);
        }
      }
    }

    const earliestMap: Map<NodeId, typeof this.scheduledFires[number]> = new Map();
    for (const sched of this.scheduledFires) {
      const prev = earliestMap.get(sched.target);
      if (!prev || sched.fireAt < prev.fireAt) {
        earliestMap.set(sched.target, sched);
      }
    }

    if (this.scheduledFires.length > 0) this.log(3, `[earliestMap] : ${JSON.stringify([...earliestMap.entries()].map(([k, v]) => [k, v]))}`, now);

    const remaining: typeof this.scheduledFires = [];
    for (const sched of this.scheduledFires) {
      if (sched.fireAt > now) {
        remaining.push(sched);
        continue;
      }

      const selected = earliestMap.get(sched.target);
      if (!selected) continue;
      this.log(3, `[TICK] Evaluating: target=${sched.target}, via=${sched.via}, fireAt=${sched.fireAt}`, now);
      this.log(3, `[TICK] selected: ${selected ? selected.via : "none"}`, now);

      const targetNode = this.nodes[sched.target];
      const path = this.getPath(sched.via);

      if (!targetNode) {
        this.log(0, `🤬[WTF] scheduledFires.target=${sched.target} not found in nodes`, now);
        continue;
      }
      if (!targetNode.isRefractory(now)) {
        this.log(1, `🔥 ${targetNode.id} Scheduled firing via (${sched.via}). `, sched.fireAt);
        targetNode.STATE.lastFiredAt = sched.fireAt;
        targetNode.setNextFiringAt(sched.fireAt);
        firingEvents.push(targetNode.id);
        this.log(3, `[TICK] 🔥 Firing target=${sched.target} via=${sched.via}`, now);

        if (path) {
          this.log(1, `✅[Path Conducted] ${path.id} : fireAt=${sched.fireAt.toFixed(0)}`, now)
          path.conduct(sched.fireAt);
          this.log(1, `  [Path Conducted] ${path.id} :  lastConductedAt=${path.STATE.lastConductedAt?.toFixed(0) ?? -1}`, now);

          firingEvents.push(path.id);
          this.log(2, `    ${path.id}.lastConductedAt = ${Math.round(path.STATE.lastConductedAt ?? -1)}: `, now);
          this.log(3, `[TICK] path.absoluteRefractoryUntil: ${path.STATE.absoluteRefractoryUntil}`, now);
        }

        this.scheduleConduction(targetNode.id, now);
        this.log(3, `[TICK] targetNode.STATE.lastFiredAt: ${targetNode.STATE.lastFiredAt}`, now);
      } else {
        this.log(2, `⛔ ${targetNode.id} is refractory  ${(now - targetNode.STATE.lastFiredAt).toFixed(0)} < ${targetNode.getRefractoryMs()} last fired at ${targetNode.STATE.lastFiredAt.toFixed(0)}`, now);
      }
    }

    this.scheduledFires = remaining;
    return firingEvents;
  }

  getReversePath(path: Path): Path | undefined {
    return this.reversePathIndex.get(path);
  }

  static createDefaultEngine(debugLevel: 0 | 1 | 2 = 0): GraphEngine {
    return new GraphEngine(defaultNodes, createDefaultPaths(), debugLevel);
  }
}

export type { Node, NodeId };
