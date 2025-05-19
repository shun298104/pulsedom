// src/types/NodeTypes.ts

export type NodeId = 
  'SA' | 'CT' | 'LA' | 'A' | 'IA' |
  'PV1' | 'PV2' | 'CTI1' | 'CTI2' | 'CTI3' |
  'AN' | 'N' | 'NH' |
  'His' | 'V' |
  'RBB' | 'LBB' | 'LAF' | 'LPF' |
  'V_sep' | 'RV' | 'LV_main' | 'RV_auto' |
  // 新規追加ノード
  'LV1BA' | 'LV2BAS' | 'LV3BS' | 'LV4BI' | 'LV5BP' | 'LV6BL' |
  'LV7MA' | 'LV8MAS' | 'LV9MS' | 'LV10MI' | 'LV11MP' | 'LV12ML' |
  'LV13AA' | 'LV14AAS' | 'LV15AI' | 'LV16AP' | 'LV17A' |
  'PLV1BA' | 'PLV2BAS' | 'PLV3BS' | 'PLV4BI' | 'PLV5BP' | 'PLV6BL' |
  'PLV7MA' | 'PLV8MAS' | 'PLV9MS' | 'PLV10MI' | 'PLV11MP' | 'PLV12ML' |
  'PLV13AA' | 'PLV14AAS' | 'PLV15AI' | 'PLV16AP' | 'PLV17A' |
  'RVB1A' | 'RVB2S' | 'RVM3A' | 'RVM4S' | 'RVA5A' | 'RVA6S' |
  'PRVB1A' | 'PRVB2S' | 'PRVM3A' | 'PRVM4S' | 'PRVA5A' | 'PRVA6S';

export interface NodeConfig {
  autoFire: boolean;
  ectopic_enabled: boolean;
  ectopic_probability: number;
  ectopic_bpmFactor: number;
  burst_enabled: boolean;
  burst_maxCount: number;
  burst_intervalMs: number;
  forceFiring: boolean;
}

export interface NodeState {
  ectopic_lastResetAt?: number;
  ectopic_nextFireAt?: number;
  burst_counter: number;
  lastFiredAt: number;
}

export interface Node {

  id: NodeId;
  bpm: number;
  primaryRefractoryMs: number;

  adaptiveRefractoryMs?: number;
  x: number;
  y: number;
  z: number;

  getRefractoryMs: () => number;
  shouldAutoFire: (now: number, dynamicHR?: number) => boolean;
  isRefractory: (now: number) => boolean;

  CONFIG: NodeConfig;
  STATE: NodeState;

  setConfig: (config: Partial<NodeConfig>) => void;
}
