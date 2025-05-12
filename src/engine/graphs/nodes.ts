import { mkNode } from './mkNodes'; // Assuming mkNode and Node types are defined as before
import { Node } from '../../types/NodeTypes'; // Assuming mkNode and Node types are defined as before

export const defaultNodes: Node[] = [
  // --- Main Conduction System & Atria ---
  mkNode('SA', 80, 200, -6.0, -3.0, -2.0,  { autoFire: true }), // Sinoatrial Node: Right, Superior, Posterior
  mkNode('CT', 0,  200, -4.0, -3.0, -1.0),                   // Crista Terminalis area: Right, Superior, sl. Posterior
  mkNode('A',  0,  200,  0.0, -3.0,  0.0),                   // General Atrial (Right Atrium): Right, Superior
  mkNode('LA', 0,  150,  2.0, -1.0,  2.0),                   // Left Atrium: Left, sl. Superior, Posterior
  mkNode('IA', 0,   50, 0.0, -0.5, -1.5),                   // Inter-Atrial (e.g. Bachmann or path to AN): Central, Sup, Post
  mkNode('AN', 0,  300,  0.2, -1.5, -1.5),                   // AV Node (atrial inputs): Central, Superior, Posterior
  mkNode('N',  0,  300,  0.1, -1.0, -1.0),                   // AV Node (compact): Central, Superior, Posterior
  mkNode('NH', 40, 300, 0.05, -0.5, -0.5,  { autoFire: true }), // AV Node (Nodal-His): Central, sl. Superior, sl. Posterior
  mkNode('His', 0, 300,  0.0,  0.0,  0.0),                   // His Bundle: Origin

  // --- Atrial extras ---
  mkNode('PV1',  0, 15, 3.5, -1.5, -3.0),                   // Pulmonary Vein 1 (LSPV): Left, Sup, Very Post
  mkNode('PV2',  0, 15, 3.1, -2.5, -4.0),                   // Pulmonary Vein 2 (LIPV): Left, Inf, Very Post
  mkNode('CTI2', 0, 50, -4.0, 0.0, -3.0),                   // Cavotricuspid Isthmus: Right, Inferior, Anterior

  // --- QRS waveform minimal test nodes / Bundle Branches / Fascicles ---
  mkNode('LBB', 120, 250, 0.5, 1.0, -0.2),                   // Left Bundle Branch: Inf, sl. Left, sl. Post
  mkNode('RBB', 120, 250, -0.5, 1.0, 0.2),                   // Right Bundle Branch: Inf, sl. Right, sl. Ant
  mkNode('LAF', 120, 250, 1.5, 1.8, 1.0),                   // Left Anterior Fascicle: LV, Inf-Ant
  mkNode('LPF', 120, 250, 1.5, 2.2, -1.0),                   // Left Posterior Fascicle: LV, Inf-Post

  // 左室ノード（LV）

  mkNode('PLV1BA',  0, 300,  1.2, 3.3, 2.2),
  mkNode('LV1BA',   0, 300,  1.4, 2.8, 2.3),

  mkNode('PLV2BAS', 0, 300, -0.8, 3.3, 1.2),
  mkNode('LV2BAS',  0, 300, -1.5, 2.8, 1.7),

  mkNode('PLV3BS',  0, 300, -0.8, 3.3, -0.8),
  mkNode('LV3BS',   0, 300, -1.9, 3.0, -1.8),

  mkNode('PLV4BI',  0, 300,  1.3, 3.3, -1.8),
  mkNode('LV4BI',   0, 300,  0.5, 3.0, -2.7),

  mkNode('PLV5BP',  0, 300,  2.9, 3.3, -0.8),
  mkNode('LV5BP',   0, 300,  3.0, 2.9, -1.8),

  mkNode('PLV6BL',  0, 300,  2.8, 3.2,  1.2),
  mkNode('LV6BL',   0, 300,  3.1, 2.9,  1.5),

  mkNode('PLV7MA',  0, 300,  1.1, 5.0,  1.5),
  mkNode('LV7MA',   0, 300,  1.2, 5.2,  2.0),

  mkNode('PLV8MAS', 0, 300,  0.3, 5.0,  0.9), 
  mkNode('LV8MAS',  0, 300, -0.6, 4.8,  1.1),  //Q wave

  mkNode('PLV9MS',  0, 300,  0.3, 5.0, -0.9),
  mkNode('LV9MS',   0, 300, -0.6, 4.8, -1.3),  //Q wave

  mkNode('PLV10MI', 0, 300,  1.0, 5.0, -1.5),
  mkNode('LV10MI',  0, 300,  1.1, 5.2, -2.2),

  mkNode('PLV11MP', 0, 300,  2.3, 5.0, -0.8),
  mkNode('LV11MP',  0, 300,  2.8, 5.2, -1.2),

  mkNode('PLV12ML', 0, 300,  2.3, 5.0,  0.8),
  mkNode('LV12ML',  0, 300,  2.7, 5.2,  1.1),

  mkNode('PLV13AA', 0, 300,  0.0, 6.5,  0.0),
  mkNode('LV13AA',  0, 300, -0.5, 7.0,  0.1),

  mkNode('PLV14AAS',0, 300,  1.0, 6.5,  1.0),
  mkNode('LV14AAS', 0, 300,  1.1, 7.0,  1.4),

  mkNode('PLV15AI', 0, 300,  1.0, 6.5, -1.0),
  mkNode('LV15AI',  0, 300,  1.1, 7.0, -1.4),

  mkNode('PLV16AP', 0, 300,  2.0, 6.5,  0.0),
  mkNode('LV16AP',  0, 300,  2.4, 7.0,  0.1),

  mkNode('PLV17A',  0, 300,  1.0, 7.0,  0.0),
  mkNode('LV17A',   0, 300,  1.1, 8.0,  0.1),

  // 右室ノード（RV）
  mkNode('PRVB1A', 0, 300, -1.6, 3.0,  2.8),
  mkNode('RVB1A',  0, 300, -2.7, 2.6,  2.5),

  mkNode('PRVB2S', 0, 300, -1.6, 3.0, -2.0),
  mkNode('RVB2S',  0, 300, -2.6, 2.6, -2.5),

  mkNode('PRVM3A', 0, 300, -1.3, 5.0,  1.8),
  mkNode('RVM3A',  0, 300, -1.7, 5.2,  2.0),

  mkNode('PRVM4S', 0, 300, -1.3, 5.0, -1.8),
  mkNode('RVM4S',  0, 300, -1.7, 5.2, -2.0),

  mkNode('PRVA5A', 0, 300,  0.8, 6.0,  1.4),
  mkNode('RVA5A',  0, 300, -1.1, 7.0,  1.5),

  mkNode('PRVA6S', 0, 300,  0.8, 6.0, -1.4),
  mkNode('RVA6S',  0, 300, -1.1, 7.0, -1.5,),
  
];