import { Node, NodeId } from '../../types/NodeTypes';

export const mkNode = (
  id: NodeId,
  bpm: number,
  refMs: number,
  autoFire: boolean,
  x: number,
  y: number,
  z: number,
): Node => ({
  id,
  bpm,
  primaryRefractoryMs: refMs,
  lastFiredAt: -1000,
  autoFire,
  x,
  y,
  z,

  getRefractoryMs(now) {
    return this.adaptiveRefractoryMs ?? this.primaryRefractoryMs;
  },

  shouldAutoFire(now, dynamicHR = 80) {
    if (this.autoFire) {
      const interval = 60000 / this.bpm;
      return now - this.lastFiredAt >= interval;
    }

    return false;
  },
});
