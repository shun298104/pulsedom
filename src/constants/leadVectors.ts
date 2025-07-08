// src/constants/leadVectors.ts
import { vec3 } from 'gl-matrix';

export const leadVectors: Record<string, { pos: vec3, norm: vec3, isChestLead: boolean }> = {
    // 双極肢誘導（I, II, III）
//    I: { pos: vec3.fromValues(0, 0, 0), norm: vec3.normalize(vec3.create(), vec3.fromValues(1, 0, 0)), isChestLead: false },
    II: { pos: vec3.fromValues(0, 0, 0), norm: vec3.normalize(vec3.create(), vec3.fromValues(Math.cos(Math.PI / 3),     Math.sin(Math.PI / 3), 0)), isChestLead: false },
//    III: { pos: vec3.fromValues(0, 0, 0), norm: vec3.normalize(vec3.create(), vec3.fromValues(- Math.cos(Math.PI / 3),  Math.sin(Math.PI / 3), 0)), isChestLead: false },
//    aVR: { pos: vec3.fromValues(0, 0, 0), norm: vec3.normalize(vec3.create(), vec3.fromValues(- Math.cos( Math.PI / 6), Math.sin(- Math.PI / 6), 0)), isChestLead: false },
//    aVL: { pos: vec3.fromValues(0, 0, 0), norm: vec3.normalize(vec3.create(), vec3.fromValues(Math.cos( Math.PI / 6),   Math.sin(- Math.PI / 8), 0)), isChestLead: false },
//    aVF: { pos: vec3.fromValues(0, 0, 0), norm: vec3.normalize(vec3.create(), vec3.fromValues(0, 1, 0)), isChestLead: false },

    // 胸部誘導（V1〜V6）
//    V1: { pos: vec3.fromValues(-5, 1, 10), norm: vec3.normalize(vec3.create(), vec3.fromValues(5, -1, -10)), isChestLead: true },
//    V2: { pos: vec3.fromValues(3,  1, 10), norm: vec3.normalize(vec3.create(), vec3.fromValues(-3, -1, -10)), isChestLead: true },
//    V3: { pos: vec3.fromValues(8,  5,  9), norm: vec3.normalize(vec3.create(), vec3.fromValues(-8, -5, -9)), isChestLead: true },
//    V4: { pos: vec3.fromValues(9,  6,  7), norm: vec3.normalize(vec3.create(), vec3.fromValues(-9, -6, -7)), isChestLead: true },
    V5: { pos: vec3.fromValues(10,  8,  4), norm: vec3.normalize(vec3.create(), vec3.fromValues(-10, -8, -4)), isChestLead: true },
//    V6: { pos: vec3.fromValues(11,  8,  2), norm: vec3.normalize(vec3.create(), vec3.fromValues(-11, -8, -2)), isChestLead: true },
};

export type LeadName = keyof typeof leadVectors;
