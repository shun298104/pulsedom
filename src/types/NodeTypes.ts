// src/types/NodeTypes.ts

export type NodeId = 'SA' | 'CT' | 'LA' | 'A' | 'IA' |
                     'PV1' | 'PV2' | 'CTI1' | 'CTI2' | 'CTI3' |
                     'AN' | 'N' | 'NH' |
                     'His' | 'V' |
                     'RBB' |  'LBB' |
                     'V_sep' | 'RV' | 'LV_main'; 


export interface Node {
  id: NodeId;
  bpm: number;
  primaryRefractoryMs: number;
  lastFiredAt: number;
  autoFire: boolean;
  adaptiveRefractoryMs?: number;
  x: number;
  y: number;
  z: number;
  getRefractoryMs: (now: number) => number;
  shouldAutoFire: (now: number, dynamicHR?: number) => boolean;

//  disabledAutoFire?: boolean;
  refractoryOverrideMs?: number;
}
