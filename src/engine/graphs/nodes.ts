import { mkNode } from './mkNodes';
import { Node } from '../../types/NodeTypes';

export const defaultNodes: Node[] = [
  mkNode('SA',  80, 200, true,   -1.5, -1.0, -1.5),
  mkNode('CT',  0,  200, false,  -1.0, -0.5, -1.0),
  mkNode('A',   0,  200, false,  -0.5, -0.3, -0.5),
  mkNode('LA',  0,  15,  false,  +0.8, -0.3, -0.5),
  mkNode('AN',  0,  300, false,  0.0,   0.0,  0.0),
  mkNode('N',   0,  300, false,  0.0,  +0.5,  0.0),
  mkNode('NH',  40, 300, true,   0.0,  +1.0,  0.0),
  mkNode('His', 0,  300, false,  0.0,  +1.5, +0.2),
  mkNode('V',   30, 300, true,   0.0,  +3.0, +0.5),

  // 💫 Atrial extras
  mkNode('IA',   0, 50, false,  +0.2, -0.2, -0.5),
  mkNode('PV1',  0, 15,  true,  +1.0, -0.6, -0.5),
  mkNode('PV2',  0, 15,  false,  +1.2, -0.2, -0.4),
  mkNode('CTI2', 0, 50, false,  -2.0,  0.0,  0.0),

  // QRS waveform minimal test nodes（開発用、一時利用）

  mkNode('LBB', 120, 250, false, -0.3, 0.4, 0.0),
  mkNode('RBB', 120, 250, false, 0.3, 0.4, 0.0),
  mkNode('V_sep', 0, 300, false, 0.3,  0.0,  0.0),
  mkNode('LV_main', 0, 300, false, 1.0, 3.0, 0.5),
  mkNode('RV', 0, 300, false, -2.0, 0.5, -0.2),
];
