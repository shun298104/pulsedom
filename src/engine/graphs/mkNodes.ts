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
): Node => ({
  id,
  bpm,
  primaryRefractoryMs: refMs,
  x,
  y,
  z,

   // CONFIGの初期化
   CONFIG: {
    autoFire: false,
    ectopic_enabled: false,
    ectopic_probability: 0.0,
    ectopic_bpmFactor: 1.0,
    burst_enabled: false,
    burst_maxCount: 0,
    burst_intervalMs: 0,
    forceFiring: false,
    ...config,
  },

  // 内部状態の初期化
  STATE: {
    lastFiredAt: -1000,
    burst_counter: 0,
  },

  // 設定適用メソッド
  setConfig(newConfig: Partial<NodeConfig>) {
    Object.assign(this.CONFIG, newConfig);
  },

  getRefractoryMs(now) {
    return this.adaptiveRefractoryMs ?? this.primaryRefractoryMs;
  },

  shouldAutoFire(now) {
    if (this.CONFIG.forceFiring){
      if(now - this.STATE.lastFiredAt >= this.getRefractoryMs(now)){
          console.log(this.id, 'forceFiring');
          this.CONFIG.forceFiring = false;
          return true;
      }
    }
    if (this.CONFIG.autoFire) {
      const interval = 60000 / this.bpm;
      return now - this.STATE.lastFiredAt >= interval;
    }

    return false;
  },
});
