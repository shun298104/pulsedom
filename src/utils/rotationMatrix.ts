// src/utils/rotationMatrix.ts
import { mat4 } from 'gl-matrix';

const DEG_TO_RAD = Math.PI / 180;
const ROTATE_X = 40 * DEG_TO_RAD;
const ROTATE_Y = 20 * DEG_TO_RAD;
const ROTATE_Z = 30 * DEG_TO_RAD;

export function createRotationMatrix(): mat4 {
    const matrix = mat4.create();
    mat4.rotateZ(matrix, matrix, ROTATE_Z);
    mat4.rotateX(matrix, matrix, ROTATE_X);
    mat4.rotateY(matrix, matrix, ROTATE_Y);
    return matrix;
}
