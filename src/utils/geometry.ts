// src/utils/geometry.ts
import { vec3 } from 'gl-matrix';
import { NodeId } from '../engine/GraphEngine';
import { defaultNodes } from '../engine/graphs/nodes';

export function getVec3FromNodePair(from: NodeId, to: NodeId): vec3 {
  const n1 = defaultNodes.find(n => n.id === from);
  const n2 = defaultNodes.find(n => n.id === to);
  if (!n1 || !n2) throw new Error(`Invalid NodeId pair: ${from} → ${to}`);

  return vec3.fromValues(n2.x - n1.x, n2.y - n1.y, n2.z - n1.z);
}
