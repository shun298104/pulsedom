//src/engine/GraphEngine.ts
import { SimOptions } from '../types/SimOptions';
import { Path } from './graphs/Path';
import { defaultNodes } from './graphs/nodes';
import { createDefaultPaths } from './graphs/paths';
import { Node, NodeId } from '../types/NodeTypes';
import { updateGraphEngineFromSim } from './GraphControl';
import { handlerMap } from '../rules/generators/customHandlers';
import { MAX_DELAY } from '../constants/constants';

export class GraphEngine {
  private debugLevel: 0 | 1 | 2 | 3 = 0;
  private debugResetTimer: number | null = null;
  private paths: Path[];
  private toNodesCache: Record<NodeId, Path[]> = {} as Record<NodeId, Path[]>;

  private reversePathIndex = new Map<Path, Path>();
  private scheduledFires: { target: NodeId; via: string; fireAt: number }[] = [];

  public nodes: Record<string, Node>;

  constructor(nodes: Node[], pathsRaw: Path[], debugLevel: 0 | 1 | 2 | 3 = 0) {
    this.debugLevel = debugLevel;
    this.nodes = Object.fromEntries(new Map(nodes.map(node => [node.id, node]))) as Record<NodeId, Node>;
    this.paths = pathsRaw.map(p => new Path(p, this.nodes, pathsRaw));

    this.buildPathCacheAndLinks();
  }

  public getPaths(): Path[] {
    return this.paths;
  }
  public getPath(pathId: string): Path | undefined {
    return this.paths.find(p => p.id === pathId);
  }
  public getNode(id: string): Node | undefined {
    return this.nodes[id];
  }

  /** ノードキャッシュとリバースリンクを構築 */
  private buildPathCacheAndLinks() {
    const pathMap = new Map<string, Path>();

    for (const path of this.paths) {
      // ノードキャッシュの作成
      (this.toNodesCache[path.from] ||= []).push(path);

      // パスのIDをMapに追加
      pathMap.set(path.id, path);

      // リバースパスのリンク処理
      if (path.reversePathId) {
        const reversePath = pathMap.get(path.reversePathId);
        if (reversePath) {
          path.setReversePath(reversePath);
          reversePath.setReversePath(path);
          this.reversePathIndex.set(path, reversePath);
          this.reversePathIndex.set(reversePath, path);
        }
      }
    }
  }

  /** ノードからの経路を取得 */
  public toNodes(from: NodeId): Path[] {
    return this.toNodesCache[from] || [];
  }

  /** デバッグログ */
  private log(level: number, message: string, now: number) {
    if (this.debugLevel >= level) {
      console.log(`[${Math.round(now)}] ${message}`);
    }
  }

  /** デバッグレベルの設定 */
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

  /** シミュレーションオプションの反映 */
  updateFromSim(simOptions: SimOptions) {
    //    console.log('[GraphEngine] updateFromSim', simOptions.sinusRate);
    this.nodes['SA'].bpm = simOptions.sinusRate;
    this.nodes['NH'].bpm = simOptions.junctionRate;
    this.nodes['PLV3BS'].bpm = simOptions.ventricleRate;
    updateGraphEngineFromSim(simOptions, this.nodes, this.paths);
  }
  updateFromCustomOptions(ruleId: string, options: Record<string, number>) {
    const handler = handlerMap[ruleId];
    if (handler) { handler(options, this); }
  }

  /** ノードの最終発火時間を取得 */
  getLastFireTime(nodeId: NodeId): number {
    return this.nodes[nodeId]?.STATE.lastFiredAt ?? -1;
  }

  // 例：Pathに任意のカスタムパラメータを適用
  public setPathCustomParams(pathId: string, params: { delayMs?: number; amplitude?: number; polarity?: number }) {
    const path = this.getPath(pathId);
    if (path) {
      if (params.delayMs !== undefined) path.delayMs = params.delayMs;
      if (params.amplitude !== undefined) path.amplitude = params.amplitude;
      if (params.polarity !== undefined) path.polarity = params.polarity;
      // ...必要に応じてPath.updateParams()なども呼ぶ
    }
  }

  /** 経路の最終伝導時間を取得 */
  public getLastConductedAt(pathId: string): number {
    return this.paths.find(p => p.id === pathId)?.lastConductedAt ?? -1;
  }

  /** 発火スケジュール */
  private scheduleConduction(from: NodeId, now: number) {
    const outgoingPaths = this.toNodes(from);

    for (const path of outgoingPaths) {
      if (path.blocked) {
        this.log(3, `  📨⛔ ${path.id} is blocked`, now);
        continue;
      }
      if (!path.canConduct(now)) {
        this.log(2, `  📨⛔ ${path.id} cannot conduct now`, now);
        continue;
      }

    // 伝導遅延を考慮して発火時間を計算
    const fireAt = now + path.getDelay();
    // pathの不応期を設定（delay後にfireされるため）
    path.absoluteRefractoryUntil = now + path.refractoryMs;

    const alreadyScheduled = this.scheduledFires.some(f => f.via === path.id && f.fireAt === fireAt);
    if (alreadyScheduled) continue;

    this.scheduledFires.push({ target: path.to, via: path.id, fireAt });
    this.log(2, `  📨 (${path.id}) scheduled at ${Math.round(fireAt)}, but NOT fired yet.`, now);
    this.log(3, `[scheduledFires was pushed!]  ${JSON.stringify(this.scheduledFires)}`, now)
    }
  }

  /** メインのtickループ */
  tick(now: number): string[] {
    if (this.scheduledFires.length>0) this.log(3, `[TICK] scheduledFires: ${JSON.stringify(this.scheduledFires)}`, now);
    const firingEvents: string[] = [];

    // 自動発火
    for (const node of Object.values(this.nodes)) {
      if (node.CONFIG?.autoFire || node.CONFIG?.forceFiring) {
        if (node.shouldAutoFire(now)) {
          node.STATE.lastFiredAt = now;
          firingEvents.push(node.id);
          this.log(1, `⚡ ${node.id} Auto firing (${node.bpm}bpm)`, now);
          this.scheduleConduction(node.id, now);
        }
      }
    }

    // 予定された伝導イベント（maxDelay考慮 + earliestMapによる決定性制御）
    const earliestMap: Map<NodeId, typeof this.scheduledFires[number]> = new Map();
    
    for (const sched of this.scheduledFires) {
      if (sched.fireAt > now + MAX_DELAY) continue;

      const prev = earliestMap.get(sched.target);
      if (!prev || sched.fireAt < prev.fireAt) {
        earliestMap.set(sched.target, sched);
      }
    }

    if(this.scheduledFires.length > 0)this.log(3, `[earliestMap] : ${JSON.stringify([...earliestMap.entries()].map(([k,v]) => [k, v]))}`, now);

    const remaining: typeof this.scheduledFires = [];
    for (const sched of this.scheduledFires) {
      // 未使用のfutureイベントは保持（maxDelay超過は上で弾かれている）
      if (sched.fireAt > now + MAX_DELAY) continue;
      if (sched.fireAt > now) {
        remaining.push(sched);
        continue;
      }

      const selected = earliestMap.get(sched.target);
      if (!selected) continue; // earliest以外は無視
      this.log(3, `[TICK] Evaluating: target=${sched.target}, via=${sched.via}, fireAt=${sched.fireAt}`, now);
      this.log(3, `[TICK] selected: ${selected ? selected.via : "none"}`, now);

      const targetNode = this.nodes[sched.target];
      const path = this.paths.find(p => p.id === sched.via);

      if (!targetNode){
        this.log(2, "targetNode dose NOT exist.", now);
        continue;
      }
      if (!targetNode.isRefractory(now)) {
        this.log(1, `🔥 ${targetNode.id} Scheduled firing via (${sched.via}). `, sched.fireAt);
        targetNode.STATE.lastFiredAt = sched.fireAt;
        firingEvents.push(targetNode.id);
        this.log(3, `[TICK] 🔥 Firing target=${sched.target} via=${sched.via}`, now);

        if (path) {
          path.lastConductedAt = sched.fireAt - path.delayMs;
          firingEvents.push(path.id);
          this.log(2, `    ${path.id}.lastConductedAt = ${Math.round(path.lastConductedAt)}: `, now);
          this.log(3, `[TICK] path.absoluteRefractoryUntil: ${path.absoluteRefractoryUntil}`, now);
        }

//        this.scheduleConduction(targetNode.id, sched.fireAt);
        this.scheduleConduction(targetNode.id, now);
        this.log(3, `[TICK] targetNode.STATE.lastFiredAt: ${targetNode.STATE.lastFiredAt}`, now);
      } else {
        this.log(2, `⛔ ${targetNode.id} is refractory  ${(now - targetNode.STATE.lastFiredAt).toFixed(0)} < ${targetNode.getRefractoryMs()} last fired at ${targetNode.STATE.lastFiredAt.toFixed(0)}`, now);
      }
    }

    this.scheduledFires = remaining;
    return firingEvents;
    
  }

  /** リバースパスを取得 */
  getReversePath(path: Path): Path | undefined {
    return this.reversePathIndex.get(path);
  }

  /** デフォルトのエンジン生成 */
  static createDefaultEngine(debugLevel: 0 | 1 | 2 = 0): GraphEngine {
    return new GraphEngine(defaultNodes, createDefaultPaths(), debugLevel);
  }
}

export type { Node, NodeId };
