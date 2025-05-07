//src/constants/leadVectors.ts
import { vec3 } from 'gl-matrix';

export const leadVectors = {
  // 双極肢誘導（I, II, III）
  I: vec3.normalize(vec3.create(), vec3.fromValues(1, 0, 0)),
  II: vec3.normalize(vec3.create(), vec3.fromValues(0.5, Math.sin(Math.PI / 3), 0)), // 60°
  III: vec3.normalize(vec3.create(), vec3.fromValues(-0.5, Math.sin(Math.PI / 3), 0)), // 120°

  // 増幅単極肢誘導（aVR, aVL, aVF）
  aVR: vec3.normalize(vec3.create(), vec3.fromValues(Math.cos((150 * Math.PI) / 180), Math.sin((150 * Math.PI) / 180), 0)),
  aVL: vec3.normalize(vec3.create(), vec3.fromValues(Math.cos((30 * Math.PI) / 180), Math.sin((30 * Math.PI) / 180), 0)),
  aVF: vec3.normalize(vec3.create(), vec3.fromValues(0, 1, 0)),

  // 胸部誘導（Z軸方向仮定）
  V1: vec3.normalize(vec3.create(), vec3.fromValues(0, 0, 1)),
  V2: vec3.normalize(vec3.create(), vec3.fromValues(0.5, 0, 1)),
  V3: vec3.normalize(vec3.create(), vec3.fromValues(1, 0.5, 1)),
  V4: vec3.normalize(vec3.create(), vec3.fromValues(1.5, 0.75, 0.75)),
  V5: vec3.normalize(vec3.create(), vec3.fromValues(2, 1, 0.5)),
  V6: vec3.normalize(vec3.create(), vec3.fromValues(2.5, 1, 0.25)),
};

export type LeadName = keyof typeof leadVectors;