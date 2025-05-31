//src/engine/graphs/mkNodes.ts
import { Node, NodeId } from '../../types/NodeTypes';
import { NodeConfig } from '../../types/NodeTypes';

export const mkNode = (
  id: NodeId,
  bpm: number,
  refMs: number,
  x: number,
  y: number,
  z: number,
  config: Partial<NodeConfig> = {}
): Node => {
  const interval = 60000 / bpm - 500;
  const nextFiringAt = config.autoFire ? interval : Infinity;

  return {
    id,
    bpm,
    primaryRefractoryMs: refMs,
    x,
    y,
    z,

    // CONFIGの初期化
    CONFIG: {
      autoFire: false,
      forceFiring: false,
      refractoryMs: undefined,
      ectopic_enabled: false,
      ectopic_probability: 0.0,
      ectopic_bpmFactor: 1.0,
      burst_enabled: false,
      burst_maxCount: 0,
      burst_intervalMs: 0,
      jitterMs: 0,
      ...config,

    },

    // 内部状態の初期化
    STATE: {
      lastFiredAt: -1000,
      nextFiringAt,
      burst_counter: 0,
    },

    // 設定適用メソッド
    setConfig(newConfig: Partial<NodeConfig>) {
      Object.assign(this.CONFIG, newConfig);
    },

    getRefractoryMs() {
      return this.adaptiveRefractoryMs ?? this.CONFIG.refractoryMs ?? this.primaryRefractoryMs;
    },

    shouldAutoFire(now) {

      if (this.CONFIG.forceFiring && !this.isRefractory(now)) {
        this.CONFIG.forceFiring = false;
        return true;
      }

      if (this.CONFIG.autoFire && now >= this.STATE.nextFiringAt) {
        return true;
      }

      return false;
    },

    setNextFiringAt(now: number) {
      if (!this.CONFIG.autoFire) return;
      this.STATE.nextFiringAt = now + 60000 / this.bpm + (Math.random() - 0.5 ) * this.CONFIG.jitterMs
//      console.log(`🎯 [${now.toFixed(0)}] ${this.id} set to nextFiringAt: ${this.STATE.nextFiringAt}`);
    },

    isRefractory(now) {
      return now - this.STATE.lastFiredAt < this.getRefractoryMs();
    }
  }
};
