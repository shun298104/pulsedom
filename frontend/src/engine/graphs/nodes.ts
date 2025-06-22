import { mkNode } from './mkNodes'; // Assuming mkNode and Node types are defined as before
import { Node } from '../../types/NodeTypes'; // Assuming mkNode and Node types are defined as before

export const defaultNodes: Node[] = [
  // --- Main Conduction System & Atria ---
  mkNode('SA',  80, 200, -3.0, -2.0, -1.0,  { autoFire: true, jitterMs: 10 }), // Sinoatrial Node: Right, Superior, Posterior
  mkNode('CT',  33, 200, -2.8, -2.0, -1.5,  { autoFire: false }),                     // Crista Terminalis area: Right, Superior, sl. Posterior

  mkNode('A',    0, 200, -2.4, -1.5, -0.9),                     // General Atrial (Right Atrium): Right, Superior
  mkNode('IAX1', 0, 150,  0.0, -1.3, -0.6),
  mkNode('IAX2', 0, 150,  0.0, -1.1, -0.3),
  mkNode('IA',   0, 150,  0.0, -1.0,  0.0),                     // Inter-Atrial node（再掲）

  mkNode('AN',  0, 100,  0.0, -0.5,  0.0),                      // AV Node (atrial inputs): Central, Superior, Posterior
  mkNode('N',   0, 200,  0.0,  0.0,  0.0),                      // AV Node (compact): Central, Superior, Posterior
  mkNode('NH', 40, 200,  0.0,  0.5,  0.0,  { autoFire: true }), // AV Node (Nodal-His): Central, sl. Superior, sl. Posterior
  mkNode('His', 0, 275,  1.2,  1.0,  1.2),                      // His Bundle: Origin

  // --- Atrial extras ---
  mkNode('BM',  0, 110,  1.5, -2.0, -1.8 ),                    // A (Y=200) → LA (Y=20) の40%位置くらいに
  mkNode('LA',  0,  75,  2.2, -1.0, -3.5),                   // Left Atrium: Left, sl. Superior, Posterior
  mkNode('PV1', 0,  60,  3.3, -1.5, -3.0),                   // Pulmonary Vein 1 (LSPV): Left, Sup, Very Post
  mkNode('PV2', 0,  60,  2.9, -2.5, -4.0),                   // Pulmonary Vein 2 (LIPV): Left, Inf, Very Post

  mkNode('CTI1',0,  50, -2.0, -2.0, -1.2),                   // Cavotricuspid Isthmus: Right, Inferior, Anterior
  mkNode('CTI2',0,  50, -3.8, -1.5, -1.5),                   // Cavotricuspid Isthmus: Right, Inferior, Anterior
  mkNode('CTI3',0,  50, -2.2, -1.0,  1.2),                   // Cavotricuspid Isthmus: Right, Inferior, Anterior

  // --- QRS waveform minimal test nodes / Bundle Branches / Fascicles ---
  mkNode('LBB', 120, 250,  0.5, 1.0, -0.2),                   // Left Bundle Branch: Inf, sl. Left, sl. Post
  mkNode('RBB', 120, 250, -0.5, 1.0,  0.2),                   // Right Bundle Branch: Inf, sl. Right, sl. Ant
  mkNode('LAF', 120, 250,  1.5, 1.8,  1.0),                   // Left Anterior Fascicle: LV, Inf-Ant
  mkNode('LPF', 120, 250,  1.5, 2.2, -1.0),                   // Left Posterior Fascicle: LV, Inf-Post

  // 左室ノード（LV）

  mkNode('PLV1BA',  0, 290,  1.2, 3.3, 2.2),
  mkNode('LV1BA',   0, 250,  1.4, 2.8, 2.3),

  mkNode('PLV2BAS', 0, 290, -0.8, 3.3, 1.2,),
  mkNode('LV2BAS',  40, 250, -1.5, 2.8, 1.7),

  mkNode('PLV3BS',  30, 290, -0.8, 3.3, -0.8, { autoFire: true }),
  mkNode('LV3BS',   40, 250, -1.9, 3.0, -1.8),

  mkNode('PLV4BI',  0, 290,  1.3, 3.3, -1.8),
  mkNode('LV4BI',   0, 250,  0.5, 3.0, -2.7),

  mkNode('PLV5BP',  0, 290,  2.9, 3.3, -0.8),
  mkNode('LV5BP',   0, 250,  3.0, 2.9, -1.8),

  mkNode('PLV6BL', 150, 290,  2.8, 3.2,  1.2),
  mkNode('LV6BL',   0, 250,  3.1, 2.9,  1.5),

  mkNode('PLV7MA',  0, 290,  1.1, 5.0,  1.5),
  mkNode('LV7MA',   0, 250,  1.2, 5.2,  2.0),

  mkNode('PLV8MAS', 0, 290,  0.3, 5.0,  0.9), 
  mkNode('LV8MAS',  0, 250, -0.6, 4.8,  1.1),  //Q wave

  mkNode('PLV9MS',  0, 290,  0.3, 5.0, -0.9),
  mkNode('LV9MS',   0, 250, -0.6, 4.8, -1.3),  //Q wave

  mkNode('PLV10MI', 0, 290,  1.0, 5.0, -1.5),
  mkNode('LV10MI',  0, 250,  1.1, 5.2, -2.2),

  mkNode('PLV11MP', 0, 290,  2.3, 5.0, -0.8),
  mkNode('LV11MP',  0, 250,  2.8, 5.2, -1.2),

  mkNode('PLV12ML', 0, 290,  2.3, 5.0,  0.8),
  mkNode('LV12ML',  0, 250,  2.7, 5.2,  1.1),

  mkNode('PLV13AA', 0, 290,  0.0, 6.5,  0.0),
  mkNode('LV13AA',  0, 250, -0.5, 7.0,  0.1),

  mkNode('PLV14AAS',0, 290,  1.0, 6.5,  1.0),
  mkNode('LV14AAS', 0, 250,  1.1, 7.0,  1.4),

  mkNode('PLV15AI', 0, 290,  1.0, 6.5, -1.0),
  mkNode('LV15AI',  0, 250,  1.1, 7.0, -1.4),

  mkNode('PLV16AP', 0, 290,  2.0, 6.5,  0.0),
  mkNode('LV16AP',  0, 250,  2.4, 7.0,  0.1),

  mkNode('PLV17A',  0, 290,  1.0, 7.0,  0.0),
  mkNode('LV17A',   0, 250,  1.1, 8.0,  0.1),

  // 右室ノード（RV）
  mkNode('PRVB1A', 0, 290, -1.6, 3.0,  2.8),
  mkNode('RVB1A',  0, 250, -2.7, 2.6,  2.5),

  mkNode('PRVB2S', 0, 290, -1.6, 3.0, -2.0),
  mkNode('RVB2S',  0, 250, -2.6, 2.6, -2.5),

  mkNode('PRVM3A', 0, 290, -1.3, 5.0,  1.8),
  mkNode('RVM3A',  0, 250, -1.7, 5.2,  2.0),

  mkNode('PRVM4S', 0, 290, -1.3, 5.0, -1.8),
  mkNode('RVM4S',  0, 250, -1.7, 5.2, -2.0),

  mkNode('PRVA5A', 30, 290,  0.8, 6.0,  1.4, { autoFire: false }),
  mkNode('RVA5A',  0,  250, -1.1, 7.0,  1.5),

  mkNode('PRVA6S', 0,  290,  0.8, 6.0, -1.4),
  mkNode('RVA6S',  30, 250, -1.1, 7.0, -1.5, { autoFire: false }),
  
];