import { vec3, mat4 } from 'gl-matrix';
import type { Node } from '../types/NodeTypes';

// ──────────────────────────────
// 電極ベクトル（cm）
// ──────────────────────────────
const limb = {
    RA: vec3.fromValues(-8, -5, 5),
    LA: vec3.fromValues( 9, -5, 5),
    LL: vec3.fromValues(  4, 11, 5),
};

const chest: Record<'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6', vec3> = {
    V1: vec3.fromValues(-3,  2, 10),
    V2: vec3.fromValues( 3,  2, 10),
    V3: vec3.fromValues( 6,  4, 8),
    V4: vec3.fromValues( 8,  5, 6),
    V5: vec3.fromValues( 9,  5, 5),
    V6: vec3.fromValues( 10, 5, 3),
};

const DEG_TO_RAD = Math.PI / 180;
const ROTATE_X = 18 * DEG_TO_RAD;  //45　apexが左
const ROTATE_Y = 16 * DEG_TO_RAD;  //30  右室が前
const ROTATE_Z = -30 * DEG_TO_RAD; //　apexが前

export function createRotationMatrix(): mat4 {
    const matrix = mat4.create();
    mat4.rotateZ(matrix, matrix, ROTATE_Z);
    mat4.rotateX(matrix, matrix, ROTATE_X);
    mat4.rotateY(matrix, matrix, ROTATE_Y);
    return matrix;
}
const ECG_ROT = createRotationMatrix();

// Chest 距離減衰係数 (均質球モデル: 1/r²)
const chestDecay = (p: vec3) => 1 / (vec3.length(p) ** 2);

export type LeadName =
    | 'I' | 'II' | 'III' | 'aVR' | 'aVL' | 'aVF'
    | 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6'
    | 'LA' | 'RA' | 'LL';

/**
 * Path → 瞬間双極子 D → 電極電位 → リード差分
 */

export function calculateDotFactors(
    fromNode: Node,
    toNode: Node,
): Record<LeadName, number> {

    // 双極子ベクトル（単位ベクトル）
    const dir = vec3.normalize(
        vec3.create(),
        vec3.fromValues(
            toNode.x - fromNode.x,
            toNode.y - fromNode.y,
            toNode.z - fromNode.z,
        ),
    );

    // ノード位置ベクトル（心臓の中心を原点と仮定）
    const NodePosition = vec3.fromValues(toNode.x, toNode.y, toNode.z);
    const rotatedPosition = vec3.create();
    vec3.transformMat4(rotatedPosition, NodePosition, ECG_ROT);

    // 双極子ベクトルの回転
    const rotatedD = vec3.transformMat4(vec3.create(), dir, ECG_ROT);
    
    // 電極電位計算
    const factors: Record<LeadName, number> = {
        I: 0, II: 0, III: 0, aVR: 0, aVL: 0, aVF: 0,
        V1: 0, V2: 0, V3: 0, V4: 0, V5: 0, V6: 0,
        RA: 0, LA: 0, LL: 0,
    };

    // Einthoven + Goldberger
    const electrodes = { RA: limb.RA, LA: limb.LA, LL: limb.LL };
    Object.entries(electrodes).forEach(([key, pos]) => {
        const r = vec3.sub(vec3.create(), pos, rotatedPosition);
        const n = vec3.normalize(vec3.create(), r);
        const dec = chestDecay(r) * 100;
        const V = vec3.dot(rotatedD, n) * dec;
        factors[key as LeadName] = V;
    });

    // Einthoven leads
    factors.I = factors.LA - factors.RA;
    factors.II = factors.LL - factors.RA;
    factors.III = factors.LL - factors.LA;
    factors.aVR = factors.RA - (factors.LA + factors.LL) / 2;
    factors.aVL = factors.LA - (factors.RA + factors.LL) / 2;
    factors.aVF = factors.LL - (factors.RA + factors.LA) / 2;

    // Chest leads
    (Object.keys(chest) as (keyof typeof chest)[]).forEach(key => {
        const pos = chest[key];
        const r = vec3.sub(vec3.create(), pos, rotatedPosition);
        const n = vec3.normalize(vec3.create(), r);
        const dec = chestDecay(r) * 100;
        // @ts-ignore  — key は V1‑V6
        factors[key as LeadName] = vec3.dot(rotatedD, n) * dec * 1.2;
    });

    return factors;
}
