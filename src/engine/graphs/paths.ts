import type { PathProps } from './Path';

export function createDefaultPaths(): PathProps[] {
  return [
    { id: 'SA->CT', from: 'SA', to: 'CT', config: { delayMs: 20, refractoryMs: 250, amplitude: 0.00, apdMs: 100 } },
    { id: 'CT->A', from: 'CT', to: 'A', config: { delayMs: 5, refractoryMs: 250, amplitude: 0.03, apdMs: 100 } },
    
    { id: 'A->IA', from: 'A', to: 'IA', reversePathId: 'A->IA_retro', config: { delayMs: 55, delayJitterMs: 4, refractoryMs: 250, amplitude: 0.15, polarity: 0.1, apdMs: 100, blocked: false } },
    { id: 'A->IA_retro', from: 'IA', to: 'A', reversePathId: 'A->IA', config: { delayMs: 60, delayJitterMs: 0, refractoryMs: 250, amplitude: 0.11, polarity: 0.1, apdMs: 100, blocked: false } },
    { id: 'IA->AN_fast', from: 'IA', to: 'AN', reversePathId: 'IA->AN_fast_retro', config: { delayMs: 15, refractoryMs: 250, amplitude: 0.03, polarity: 0, apdMs: 100, conductionProbability: 1 } },
    
    { id: 'IA->AN_fast_retro', from: 'AN', to: 'IA', reversePathId: 'IA->AN_fast', config: { delayMs: 25, refractoryMs: 275, amplitude: 0.02, polarity: 0, apdMs: 100 } },
    { id: 'IA->AN_slow_retro_3', from: 'AN', to: 'IAX2', reversePathId: 'IA->AN_slow_3', config: { delayMs: 40, refractoryMs: 50, amplitude: 0.00, apdMs: 100 } },
    { id: 'IA->AN_slow_retro_2', from: 'IAX2', to: 'IAX1', reversePathId: 'IA->AN_slow_2', config: { delayMs: 40, refractoryMs: 50, amplitude: 0.00, apdMs: 100 } },
    { id: 'IA->AN_slow_retro_1', from: 'IAX1', to: 'IA', reversePathId: 'IA->AN_slow_1', config: { delayMs: 40, refractoryMs: 250, amplitude: 0.00, apdMs: 100 } },
    
    { id: 'A->BM', from: 'A', to: 'BM', config: { delayMs: 20, delayJitterMs: 0, refractoryMs: 250, amplitude: 0.01, polarity: 0, apdMs: 100, blocked: false } },
    { id: 'BM->LA', from: 'BM', to: 'LA', config: { delayMs: 40, delayJitterMs: 0, refractoryMs: 250, amplitude: 0.07, polarity: 0, apdMs: 100, blocked: false } },
    { id: 'LA->IA', from: 'LA', to: 'IA', config: { delayMs: 30, delayJitterMs: 3, refractoryMs: 80, amplitude: 0.03, polarity: 0, apdMs: 100, blocked: false } },
    { id: 'LA->IA_retro', from: 'IA', to: 'LA', config: { delayMs: 30, delayJitterMs: 0, refractoryMs: 80, amplitude: 0.05, polarity: 0, apdMs: 100, blocked: true } },
    
    { id: 'AN->N_retro', from: 'N', to: 'AN', reversePathId: 'AN->N', config: { delayMs: 10, refractoryMs: 300, amplitude: 0.01, apdMs: 100 } },
    { id: 'N->NH_retro', from: 'NH', to: 'N', reversePathId: 'N->NH', config: { delayMs: 20, refractoryMs: 300, amplitude: 0.00, apdMs: 100 } },
    { id: 'His->NH_retro', from: 'His', to: 'NH', reversePathId: 'NH->His', config: { delayMs: 42, refractoryMs: 300, amplitude: 0.00, apdMs: 100 } },
    { id: 'A->LA_retro', from: 'LA', to: 'A', reversePathId: 'A->LA', config: { delayMs: 42, refractoryMs: 300, amplitude: 0.00, apdMs: 100, blocked: false } },
    
    //Af
    { id: 'LA->PV1', from: 'LA', to: 'PV1', config: { delayMs: 45, delayJitterMs: 5, refractoryMs: 25, amplitude: 0.1, apdMs: 100, blocked: true } },
    { id: 'PV1->PV2', from: 'PV1', to: 'PV2', config: { delayMs: 45, delayJitterMs: 5, refractoryMs: 25, amplitude: 0.1, apdMs: 100, blocked: true } },
    { id: 'PV2->LA', from: 'PV2', to: 'LA', config: { delayMs: 45, delayJitterMs: 5, refractoryMs: 25, amplitude: 0.1, apdMs: 100, blocked: true } },

    //AFL
    { id: 'IA->CTI1', from: 'IA', to: 'CTI1', config: { delayMs: 55, delayJitterMs: 5, refractoryMs: 60, amplitude: 0.0, apdMs: 30, blocked: true, polarity: 0 } },
    { id: 'CTI1->CTI2', from: 'CTI1', to: 'CTI2', config: { delayMs: 55, delayJitterMs: 5, refractoryMs: 60, amplitude: 1.4, apdMs: 30, blocked: false, polarity: 0 } },
    { id: 'CTI2->CTI3', from: 'CTI2', to: 'CTI3', config: { delayMs: 55, delayJitterMs: 5, refractoryMs: 60, amplitude: 0.0, apdMs: 30, blocked: false, polarity: 0 } },
    { id: 'CTI3->IA', from: 'CTI3', to: 'IA', config: { delayMs: 55, delayJitterMs: 5, refractoryMs: 60, amplitude: 0.0, apdMs: 30, blocked: false, polarity: 0 } },

    { id: 'AN->N', from: 'AN', to: 'N', reversePathId: 'AN->N_retro', config: { delayMs: 5, refractoryMs: 200, amplitude: 0.00, apdMs: 100, blocked: false } },
    { id: 'N->NH', from: 'N', to: 'NH', reversePathId: 'N->NH_retro', config: { delayMs: 30, refractoryMs: 250, amplitude: 0.00, apdMs: 100 } },
    { id: 'NH->His', from: 'NH', to: 'His', reversePathId: 'His->NH_retro', config: { delayMs: 5, refractoryMs: 200, amplitude: 0.00, apdMs: 100 } },
    { id: 'LV8MAS-His', from: 'LV8MAS', to: 'His', config: { amplitude: 0.0, delayMs: 25, apdMs: 250, refractoryMs: 250 } },
    { id: 'His->LBB', from: 'His', to: 'LBB', config: { delayMs: 3, refractoryMs: 320, amplitude: 0.00, apdMs: 100 } },
    { id: 'His->RBB', from: 'His', to: 'RBB', config: { delayMs: 7, refractoryMs: 330, amplitude: 0.00, apdMs: 100 } },
    { id: 'LBB->LAF', from: 'LBB', to: 'LAF', config: { delayMs: 4, refractoryMs: 300, amplitude: 0.00, apdMs: 100 } },
    { id: 'LBB->LPF', from: 'LBB', to: 'LPF', config: { delayMs: 4, refractoryMs: 310, amplitude: 0.00, apdMs: 100 } },
    { id: 'LBB-PLV2BAS', from: 'LBB', to: 'PLV2BAS', config: { amplitude: 0.0, delayMs: 31, apdMs: 150, refractoryMs: 330 } },
    { id: 'LBB-PLV3BS', from: 'LBB', to: 'PLV3BS', config: { amplitude: 0.0, delayMs: 31, apdMs: 150, refractoryMs: 330 } },
    { id: 'LBB-PLV8MAS', from: 'LBB', to: 'PLV8MAS', config: { amplitude: 0.0, delayMs: 5, apdMs: 150, refractoryMs: 330 } },
    { id: 'LBB-PLV9MS', from: 'LBB', to: 'PLV9MS', config: { amplitude: 0.0, delayMs: 5, apdMs: 150, refractoryMs: 330 } },
    { id: 'LAF-PLV7MA', from: 'LAF', to: 'PLV7MA', config: { amplitude: 0.0, delayMs: 20, apdMs: 150, refractoryMs: 330 } },
    { id: 'LAF-PLV10MI', from: 'LAF', to: 'PLV10MI', config: { amplitude: 0.0, delayMs: 20, apdMs: 150, refractoryMs: 330 } },
    { id: 'LAF-PLV11MP', from: 'LAF', to: 'PLV11MP', config: { amplitude: 0.0, delayMs: 21, apdMs: 150, refractoryMs: 330 } },
    { id: 'LAF-PLV12ML', from: 'LAF', to: 'PLV12ML', config: { amplitude: 0.0, delayMs: 21, apdMs: 150, refractoryMs: 330 } },
    { id: 'LAF-PLV13AA', from: 'LAF', to: 'PLV13AA', config: { amplitude: 0.0, delayMs: 21, apdMs: 150, refractoryMs: 330 } },
    { id: 'LAF-PLV14AAS', from: 'LAF', to: 'PLV14AAS', config: { amplitude: 0.0, delayMs: 20, apdMs: 150, refractoryMs: 330 } },
    { id: 'LAF-PLV15AI', from: 'LAF', to: 'PLV15AI', config: { amplitude: 0.0, delayMs: 20, apdMs: 150, refractoryMs: 330 } },
    { id: 'LPF-PLV1BA', from: 'LPF', to: 'PLV1BA', config: { amplitude: 0.0, delayMs: 33, apdMs: 150, refractoryMs: 330 } },
    { id: 'LPF-PLV4BI', from: 'LPF', to: 'PLV4BI', config: { amplitude: 0.0, delayMs: 33, apdMs: 150, refractoryMs: 330 } },
    { id: 'LPF-PLV5BP', from: 'LPF', to: 'PLV5BP', config: { amplitude: 0.0, delayMs: 23, apdMs: 150, refractoryMs: 330 } },
    { id: 'LPF-PLV6BL', from: 'LPF', to: 'PLV6BL', config: { amplitude: 0.0, delayMs: 23, apdMs: 150, refractoryMs: 330 } },
    { id: 'LPF-PLV16AP', from: 'LPF', to: 'PLV16AP', config: { amplitude: 0.0, delayMs: 21, apdMs: 150, refractoryMs: 330 } },
    { id: 'LPF-PLV17A', from: 'LPF', to: 'PLV17A', config: { amplitude: 0.0, delayMs: 21, apdMs: 150, refractoryMs: 330 } },

    // RBB → 右室プルキンエ繊維（6本）His-7ms
    { id: 'RBB-PRVB1A', from: 'RBB', to: 'PRVB1A', config: { amplitude: 0.0, delayMs: 31, apdMs: 150, refractoryMs: 330 } },
    { id: 'RBB-PRVB2S', from: 'RBB', to: 'PRVB2S', config: { amplitude: 0.0, delayMs: 31, apdMs: 150, refractoryMs: 330 } },
    { id: 'RBB-PRVM3A', from: 'RBB', to: 'PRVM3A', config: { amplitude: 0.0, delayMs: 21, apdMs: 150, refractoryMs: 330 } },
    { id: 'RBB-PRVM4S', from: 'RBB', to: 'PRVM4S', config: { amplitude: 0.0, delayMs: 17, apdMs: 150, refractoryMs: 330 } },
    { id: 'RBB-PRVA5A', from: 'RBB', to: 'PRVA5A', config: { amplitude: 0.0, delayMs: 19, apdMs: 150, refractoryMs: 330 } },
    { id: 'RBB-PRVA6S', from: 'RBB', to: 'PRVA6S', config: { amplitude: 0.0, delayMs: 19, apdMs: 150, refractoryMs: 330 } },

    // プルキンエ終末ー左室
    { id: 'PLV1BA-LV1BA', from: 'PLV1BA', to: 'LV1BA', config: { amplitude: 0.18, delayMs: 10, apdMs: 180, refractoryMs: 290, polarity: -0.4 } },
    { id: 'PLV2BAS-LV2BAS', from: 'PLV2BAS', to: 'LV2BAS', config: { amplitude: 0.30, delayMs: 13, apdMs: 180, refractoryMs: 290, polarity: -0.2 } },
    { id: 'PLV3BS-LV3BS', from: 'PLV3BS', to: 'LV3BS', config: { amplitude: 0.30, delayMs: 13, apdMs: 180, refractoryMs: 290, polarity: -0.2 } },
    { id: 'PLV4BI-LV4BI', from: 'PLV4BI', to: 'LV4BI', config: { amplitude: 0.30, delayMs: 13, apdMs: 180, refractoryMs: 290, polarity: -0.2 } },
    { id: 'PLV5BP-LV5BP', from: 'PLV5BP', to: 'LV5BP', config: { amplitude: 0.30, delayMs: 13, apdMs: 180, refractoryMs: 290, polarity: -0.2 } },
    { id: 'PLV6BL-LV6BL', from: 'PLV6BL', to: 'LV6BL', config: { amplitude: 0.20, delayMs: 10, apdMs: 180, refractoryMs: 290, polarity: -0.4 } },
    { id: 'PLV7MA-LV7MA', from: 'PLV7MA', to: 'LV7MA', config: { amplitude: 0.18, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 } },
    { id: 'PLV8MAS-LV8MAS', from: 'PLV8MAS', to: 'LV8MAS', config: { amplitude: 0.35, delayMs: 13, apdMs: 200, refractoryMs: 290, polarity: -0.3 } },
    { id: 'PLV9MS-LV9MS', from: 'PLV9MS', to: 'LV9MS', config: { amplitude: 0.35, delayMs: 13, apdMs: 200, refractoryMs: 290, polarity: -0.3 } },
    { id: 'PLV10MI-LV10MI', from: 'PLV10MI', to: 'LV10MI', config: { amplitude: 0.20, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 } },
    { id: 'PLV11MP-LV11MP', from: 'PLV11MP', to: 'LV11MP', config: { amplitude: 0.20, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 } },
    { id: 'PLV12ML-LV12ML', from: 'PLV12ML', to: 'LV12ML', config: { amplitude: 0.17, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 } },
    { id: 'PLV13AA-LV13AA', from: 'PLV13AA', to: 'LV13AA', config: { amplitude: 0.17, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 } },
    { id: 'PLV14AAS-LV14AAS', from: 'PLV14AAS', to: 'LV14AAS', config: { amplitude: 0.22, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 } },
    { id: 'PLV15AI-LV15AI', from: 'PLV15AI', to: 'LV15AI', config: { amplitude: 0.22, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 } },
    { id: 'PLV16AP-LV16AP', from: 'PLV16AP', to: 'LV16AP', config: { amplitude: 0.17, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 } },
    { id: 'PLV17A-LV17A', from: 'PLV17A', to: 'LV17A', config: { amplitude: 0.10, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 } },

    // 右室プルキンエ繊維 → 右室筋
    { id: 'PRVB1A-RVB1A', from: 'PRVB1A', to: 'RVB1A', config: { amplitude: 0.12, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.3 } },
    { id: 'PRVB2S-RVB2S', from: 'PRVB2S', to: 'RVB2S', config: { amplitude: 0.12, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.3 } },
    { id: 'PRVM3A-RVM3A', from: 'PRVM3A', to: 'RVM3A', config: { amplitude: 0.12, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.3 } },
    { id: 'PRVM4S-RVM4S', from: 'PRVM4S', to: 'RVM4S', config: { amplitude: 0.12, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.3 } },
    { id: 'PRVA5A-RVA5A', from: 'PRVA5A', to: 'RVA5A', config: { amplitude: 0.12, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.3 } },
    { id: 'PRVA6S-RVA6S', from: 'PRVA6S', to: 'RVA6S', config: { amplitude: 0.12, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.3 } },

    // 短軸方向（Bレベル）
    { id: 'LV1BA-LV2BAS', from: 'LV1BA', to: 'LV2BAS', reversePathId: 'LV2BAS-LV1BA', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV2BAS-LV3BS', from: 'LV2BAS', to: 'LV3BS', reversePathId: 'LV3BS-LV2BAS', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV3BS-LV4BI', from: 'LV3BS', to: 'LV4BI', reversePathId: 'LV4BI-LV3BS', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV4BI-LV5BP', from: 'LV4BI', to: 'LV5BP', reversePathId: 'LV5BP-LV4BI', config: { amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV5BP-LV6BL', from: 'LV5BP', to: 'LV6BL', reversePathId: 'LV6BL-LV5BP', config: { amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV6BL-LV1BA', from: 'LV6BL', to: 'LV1BA', reversePathId: 'LV1BA-LV6BL', config: { amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },

    // Mレベル
    { id: 'LV7MA-LV8MAS', from: 'LV7MA', to: 'LV8MAS', reversePathId: 'LV8MAS-LV7MA', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV10MI-LV11MP', from: 'LV10MI', to: 'LV11MP', reversePathId: 'LV11MP-LV10MI', config: { amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV11MP-LV12ML', from: 'LV11MP', to: 'LV12ML', reversePathId: 'LV12ML-LV11MP', config: { amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV12ML-LV7MA', from: 'LV12ML', to: 'LV7MA', reversePathId: 'LV7MA-LV12ML', config: { amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },

    // Aレベル
    { id: 'LV13AA-LV14AAS', from: 'LV13AA', to: 'LV14AAS', reversePathId: 'LV14AAS-LV13AA', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV14AAS-LV15AI', from: 'LV14AAS', to: 'LV15AI', reversePathId: 'LV15AI-LV14AAS', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV15AI-LV16AP', from: 'LV15AI', to: 'LV16AP', reversePathId: 'LV16AP-LV15AI', config: { amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV13AA-LV16AP', from: 'LV13AA', to: 'LV16AP', reversePathId: 'LV16AP-LV13AA', config: { amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },

    // 左室の逆方向接続
    { id: 'LV2BAS-LV1BA', from: 'LV2BAS', to: 'LV1BA', reversePathId: 'LV1BA-LV2BAS', config: { amplitude: 0.0, delayMs: 17, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV3BS-LV2BAS', from: 'LV3BS', to: 'LV2BAS', reversePathId: 'LV2BAS-LV3BS', config: { amplitude: 0.0, delayMs: 17, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV4BI-LV3BS', from: 'LV4BI', to: 'LV3BS', reversePathId: 'LV3BS-LV4BI', config: { amplitude: 0.0, delayMs: 17, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV5BP-LV4BI', from: 'LV5BP', to: 'LV4BI', reversePathId: 'LV4BI-LV5BP', config: { amplitude: 0.0, delayMs: 17, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV6BL-LV5BP', from: 'LV6BL', to: 'LV5BP', reversePathId: 'LV5BP-LV6BL', config: { amplitude: 0.0, delayMs: 17, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV1BA-LV6BL', from: 'LV1BA', to: 'LV6BL', reversePathId: 'LV6BL-LV1BA', config: { amplitude: 0.0, delayMs: 17, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },

    { id: 'LV10MI-LV9MS', from: 'LV10MI', to: 'LV9MS', reversePathId: 'LV9MS-LV10MI', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV11MP-LV10MI', from: 'LV11MP', to: 'LV10MI', reversePathId: 'LV10MI-LV11MP', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV12ML-LV11MP', from: 'LV12ML', to: 'LV11MP', reversePathId: 'LV11MP-LV12ML', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV7MA-LV12ML', from: 'LV7MA', to: 'LV12ML', reversePathId: 'LV12ML-LV7MA', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },

    { id: 'LV14AAS-LV13AA', from: 'LV14AAS', to: 'LV13AA', reversePathId: 'LV13AA-LV14AAS', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV15AI-LV14AAS', from: 'LV15AI', to: 'LV14AAS', reversePathId: 'LV14AAS-LV15AI', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV16AP-LV15AI', from: 'LV16AP', to: 'LV15AI', reversePathId: 'LV15AI-LV16AP', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },
    { id: 'LV16AP-LV13AA', from: 'LV13AA', to: 'LV16AP', reversePathId: 'LV13AA-LV16AP', config: { amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 250, polarity: 0.0, priority: 2 } },

    // 長軸方向
    { id: 'LV1BA-LV7MA', from: 'LV1BA', to: 'LV7MA', reversePathId: 'LV7MA-LV1BA', config: { amplitude: 0.05, delayMs: 37, apdMs: 230, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'LV7MA-LV1BA', from: 'LV7MA', to: 'LV1BA', reversePathId: 'LV1BA-LV7MA', config: { amplitude: 0.05, delayMs: 37, apdMs: 230, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'LV7MA-LV13AA', from: 'LV7MA', to: 'LV13AA', reversePathId: 'LV13AA-LV7MA', config: { amplitude: 0.05, delayMs: 31, apdMs: 230, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'LV13AA-LV7MA', from: 'LV13AA', to: 'LV7MA', reversePathId: 'LV7MA-LV13AA', config: { amplitude: 0.05, delayMs: 31, apdMs: 230, refractoryMs: 250, polarity: 0.5, priority: 2 } },

    { id: 'LV2BAS-LV8MAS', from: 'LV2BAS', to: 'LV8MAS', reversePathId: 'LV8MAS-LV2BAS', config: { amplitude: 0.4, delayMs: 37, apdMs: 270, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'LV14AAS-LV8MAS', from: 'LV14AAS', to: 'LV8MAS', reversePathId: 'LV8MAS-LV14AAS', config: { amplitude: 0.3, delayMs: 31, apdMs: 270, refractoryMs: 250, polarity: 0.5, priority: 2 } },

    { id: 'LV3BS-LV9MS', from: 'LV3BS', to: 'LV9MS', reversePathId: 'LV9MS-LV3BS', config: { amplitude: 0.4, delayMs: 37, apdMs: 270, refractoryMs: 250, polarity: 0.5, priority: 2 } },

    // LV4BI-LV10MI-LV15AI
    { id: 'LV4BI-LV10MI', from: 'LV4BI', to: 'LV10MI', reversePathId: 'LV10MI-LV4BI', config: { amplitude: 0.04, delayMs: 31, apdMs: 230, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'LV10MI-LV4BI', from: 'LV10MI', to: 'LV4BI', reversePathId: 'LV4BI-LV10MI', config: { amplitude: 0.04, delayMs: 31, apdMs: 230, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'LV10MI-LV15AI', from: 'LV10MI', to: 'LV15AI', reversePathId: 'LV15AI-LV10MI', config: { amplitude: 0.04, delayMs: 23, apdMs: 230, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'LV15AI-LV10MI', from: 'LV15AI', to: 'LV10MI', reversePathId: 'LV10MI-LV15AI', config: { amplitude: 0.04, delayMs: 23, apdMs: 230, refractoryMs: 250, polarity: 0.5, priority: 2 } },

    // LV5BP-LV11MP-LV16AP
    { id: 'LV5BP-LV11MP', from: 'LV5BP', to: 'LV11MP', reversePathId: 'LV11MP-LV5BP', config: { amplitude: 0.04, delayMs: 31, apdMs: 210, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'LV11MP-LV5BP', from: 'LV11MP', to: 'LV5BP', reversePathId: 'LV5BP-LV11MP', config: { amplitude: 0.04, delayMs: 31, apdMs: 210, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'LV11MP-LV16AP', from: 'LV11MP', to: 'LV16AP', reversePathId: 'LV16AP-LV11MP', config: { amplitude: 0.03, delayMs: 23, apdMs: 210, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'LV16AP-LV11MP', from: 'LV16AP', to: 'LV11MP', reversePathId: 'LV11MP-LV16AP', config: { amplitude: 0.03, delayMs: 23, apdMs: 210, refractoryMs: 250, polarity: 0.5, priority: 2 } },

    // LV6BL-LV12ML
    { id: 'LV6BL-LV12ML', from: 'LV6BL', to: 'LV12ML', reversePathId: 'LV12ML-LV6BL', config: { amplitude: 0.04, delayMs: 31, apdMs: 210, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'LV12ML-LV6BL', from: 'LV12ML', to: 'LV6BL', reversePathId: 'LV6BL-LV12ML', config: { amplitude: 0.03, delayMs: 23, apdMs: 210, refractoryMs: 250, polarity: 0.5, priority: 2 } },

    // a -apex
    { id: 'LV13AA-LV17A', from: 'LV13AA', to: 'LV17A', reversePathId: 'LV17A-LV13AA', config: { amplitude: 0.02, delayMs: 19, apdMs: 210, refractoryMs: 250, polarity: 0.4, priority: 2 } },
    { id: 'LV14AAS-LV17A', from: 'LV14AAS', to: 'LV17A', reversePathId: 'LV17A-LV14AAS', config: { amplitude: 0.02, delayMs: 19, apdMs: 210, refractoryMs: 250, polarity: 0.4, priority: 2 } },
    { id: 'LV15AI-LV17A', from: 'LV15AI', to: 'LV17A', reversePathId: 'LV17A-LV15AI', config: { amplitude: 0.01, delayMs: 17, apdMs: 210, refractoryMs: 250, polarity: 0.4, priority: 2 } },
    { id: 'LV16AP-LV17A', from: 'LV16AP', to: 'LV17A', reversePathId: 'LV17A-LV16AP', config: { amplitude: 0.01, delayMs: 17, apdMs: 210, refractoryMs: 250, polarity: 0.4, priority: 2 } },

    // a -apex（逆方向）
    { id: 'LV17A-LV13AA', from: 'LV17A', to: 'LV13AA', reversePathId: 'LV13AA-LV17A', config: { amplitude: 0.01, delayMs: 31, apdMs: 210, refractoryMs: 250, polarity: 0.4, priority: 2 } },
    { id: 'LV17A-LV14AAS', from: 'LV17A', to: 'LV14AAS', reversePathId: 'LV14AAS-LV17A', config: { amplitude: 0.01, delayMs: 31, apdMs: 210, refractoryMs: 250, polarity: 0.4, priority: 2 } },
    { id: 'LV17A-LV15AI', from: 'LV17A', to: 'LV15AI', reversePathId: 'LV15AI-LV17A', config: { amplitude: 0.01, delayMs: 29, apdMs: 210, refractoryMs: 250, polarity: 0.4, priority: 2 } },
    { id: 'LV17A-LV16AP', from: 'LV17A', to: 'LV16AP', reversePathId: 'LV16AP-LV17A', config: { amplitude: 0.01, delayMs: 29, apdMs: 210, refractoryMs: 250, polarity: 0.4, priority: 2 } },

    // 右室の接続
    { id: 'RVB1A-RVB2S', from: 'RVB1A', to: 'RVB2S', reversePathId: 'RVB2S-RVB1A', config: { amplitude: 0.0, delayMs: 13, apdMs: 210, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'RVB2S-RVB1A', from: 'RVB2S', to: 'RVB1A', reversePathId: 'RVB1A-RVB2S', config: { amplitude: 0.0, delayMs: 13, apdMs: 210, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'RVM3A-RVM4S', from: 'RVM3A', to: 'RVM4S', reversePathId: 'RVM4S-RVM3A', config: { amplitude: 0.0, delayMs: 11, apdMs: 210, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'RVM4S-RVM3A', from: 'RVM4S', to: 'RVM3A', reversePathId: 'RVM3A-RVM4S', config: { amplitude: 0.0, delayMs: 11, apdMs: 210, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'RVA5A-RVA6S', from: 'RVA5A', to: 'RVA6S', reversePathId: 'RVA6S-RVA5A', config: { amplitude: 0.0, delayMs: 11, apdMs: 210, refractoryMs: 250, polarity: 0.5, priority: 2 } },
    { id: 'RVA6S-RVA5A', from: 'RVA6S', to: 'RVA5A', reversePathId: 'RVA5A-LV6BL', config: { amplitude: 0.0, delayMs: 11, apdMs: 210, refractoryMs: 250, polarity: 0.5, priority: 2 } },

    // 右室と左室のAnterior接続
    { id: 'RVB1A-LV2BAS', from: 'RVB1A', to: 'LV2BAS', reversePathId: 'LV2BAS-RVB1A', config: { amplitude: 0.0, delayMs: 19, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'LV2BAS-RVB1A', from: 'LV2BAS', to: 'RVB1A', reversePathId: 'RVB1A-LV2BAS', config: { amplitude: 0.0, delayMs: 19, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'RVM3A-LV8MAS', from: 'RVM3A', to: 'LV8MAS', reversePathId: 'LV8MAS-RVM3A', config: { amplitude: 0.0, delayMs: 17, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    // { id: 'LV8MAS-RVM3A', from: 'LV8MAS', to: 'RVM3A', reversePathId: 'RVM3A-LV8MAS', config: { amplitude: 0.0, delayMs: 17, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'RVA5A-LV14AAS', from: 'RVA5A', to: 'LV14AAS', reversePathId: 'LV14AAS-RVA5A', config: { amplitude: 0.0, delayMs: 13, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'LV14AAS-RVA5A', from: 'LV14AAS', to: 'RVA5A', reversePathId: 'RVA5A-LV14AAS', config: { amplitude: 0.0, delayMs: 13, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },

    // 右室と左室のSeptal接続
    { id: 'RVB2S-LV3BS', from: 'RVB2S', to: 'LV3BS', reversePathId: 'LV3BS-RVB2S', config: { amplitude: 0.0, delayMs: 19, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'LV3BS-RVB2S', from: 'LV3BS', to: 'RVB2S', reversePathId: 'RVB2S-LV3BS', config: { amplitude: 0.0, delayMs: 19, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'RVM4S-LV9MS', from: 'RVM4S', to: 'LV9MS', reversePathId: 'LV9MS-RVM4S', config: { amplitude: 0.0, delayMs: 17, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    // { id: 'LV9MS-RVM4S', from: 'LV9MS', to: 'RVM4S', reversePathId: 'RVM4S-LV9MS', config: { amplitude: 0.0, delayMs: 17, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'RVA6S-LV15AI', from: 'RVA6S', to: 'LV15AI', reversePathId: 'LV15AI-RVA6S', config: { amplitude: 0.0, delayMs: 13, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'LV15AI-RVA6S', from: 'LV15AI', to: 'RVA6S', reversePathId: 'RVA6S-LV15AI', config: { amplitude: 0.0, delayMs: 13, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },

    // 右室の長軸伝導
    { id: 'RVB1A-RVM3A', from: 'RVB1A', to: 'RVM3A', reversePathId: 'RVM3A-RVB1A', config: { amplitude: 0.05, delayMs: 29, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'RVM3A-RVA5A', from: 'RVM3A', to: 'RVA5A', reversePathId: 'RVA5A-RVM3A', config: { amplitude: 0.05, delayMs: 23, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'RVB2S-RVM4S', from: 'RVB2S', to: 'RVM4S', reversePathId: 'RVM4S-RVB2S', config: { amplitude: 0.05, delayMs: 29, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'RVM4S-RVA6S', from: 'RVM4S', to: 'RVA6S', reversePathId: 'RVA6S-RVM4S', config: { amplitude: 0.05, delayMs: 23, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },

    // 右室の長軸伝導（逆方向）
    { id: 'RVM3A-RVB1A', from: 'RVM3A', to: 'RVB1A', reversePathId: 'RVB1A-RVM3A', config: { amplitude: 0.05, delayMs: 29, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'RVA5A-RVM3A', from: 'RVA5A', to: 'RVM3A', reversePathId: 'RVM3A-RVA5A', config: { amplitude: 0.05, delayMs: 23, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'RVM4S-RVB2S', from: 'RVM4S', to: 'RVB2S', reversePathId: 'RVB2S-RVM4S', config: { amplitude: 0.05, delayMs: 29, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } },
    { id: 'RVA6S-RVM4S', from: 'RVA6S', to: 'RVM4S', reversePathId: 'RVM4S-RVA6S', config: { amplitude: 0.05, delayMs: 23, apdMs: 210, refractoryMs: 250, polarity: 0.3, priority: 2 } }

  ];
}
