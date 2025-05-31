import type { PathProps } from './Path';

export function createDefaultPaths(): PathProps[] {
  return [
    // --- 正方向（順行P波 + AV伝導 + 心室）---
    { id: 'SA->CT', from: 'SA', to: 'CT', delayMs: 20, refractoryMs: 250, amplitude: 0.00, apdMs: 100 },
    { id: 'CT->A',  from: 'CT', to: 'A',  delayMs:  5, refractoryMs: 250, amplitude: 0.03, apdMs: 100 },

    { id: 'A->IA',       from: 'A', to: 'IA', delayMs: 55, delayJitterMs: 4, refractoryMs: 250, amplitude: 0.15, polarity: 0.1, apdMs: 100, reversePathId: 'A->IA_retro' , blocked: false },
    { id: 'A->IA_retro', from: 'IA', to: 'A', delayMs: 60, delayJitterMs: 0, refractoryMs: 250, amplitude: 0.11, polarity: 0.1, apdMs: 100, reversePathId: 'A->IA', blocked: false },

    { id: 'IA->AN_fast',       from: 'IA', to: 'AN', delayMs: 15, refractoryMs: 250, amplitude: 0.03, polarity: 0, apdMs: 100, conductionProbability: 1, reversePathId: 'IA->AN_fast_retro' },
    { id: 'IA->AN_fast_retro', from: 'AN', to: 'IA', delayMs: 25, refractoryMs: 275, amplitude: 0.02, polarity: 0, apdMs: 100, reversePathId: 'IA->AN_fast' },

    // 正向き: IA -> AN_slow
    { id: 'IA->AN_slow_retro_3', from: 'AN',   to: 'IAX2', delayMs: 40, refractoryMs: 50, amplitude: 0.00, apdMs: 100, reversePathId: 'IA->AN_slow_3' },
    { id: 'IA->AN_slow_retro_2', from: 'IAX2', to: 'IAX1', delayMs: 40, refractoryMs: 50, amplitude: 0.00, apdMs: 100, reversePathId: 'IA->AN_slow_2' },
    { id: 'IA->AN_slow_retro_1', from: 'IAX1', to: 'IA',   delayMs: 40, refractoryMs: 250, amplitude: 0.00, apdMs: 100, reversePathId: 'IA->AN_slow_1' },

    // 逆向き: AN -> IA (retro)
    { id: 'IA->AN_slow_retro_3', from: 'AN',   to: 'IAX2', delayMs: 40, refractoryMs: 50, amplitude: 0.00, apdMs: 100, reversePathId: 'IA->AN_slow_3' },
    { id: 'IA->AN_slow_retro_2', from: 'IAX2', to: 'IAX1', delayMs: 40, refractoryMs: 50, amplitude: 0.00, apdMs: 100, reversePathId: 'IA->AN_slow_2' },
    { id: 'IA->AN_slow_retro_1', from: 'IAX1', to: 'IA',   delayMs: 40, refractoryMs: 250, amplitude: 0.00, apdMs: 100, reversePathId: 'IA->AN_slow_1' },

    // --- 心房末端 + LA経由 ---
    { id: 'A->BM',  from: 'A',  to: 'BM', delayMs: 20, delayJitterMs: 0, refractoryMs: 250, amplitude: 0.01, polarity: 0, apdMs: 100, blocked: false },
    { id: 'BM->LA', from: 'BM', to: 'LA', delayMs: 40, delayJitterMs: 0, refractoryMs: 250, amplitude: 0.07, polarity: 0, apdMs: 100, blocked: false },
    { id: 'LA->IA', from: 'LA', to: 'IA', delayMs: 30, delayJitterMs: 3, refractoryMs:  80, amplitude: 0.03, polarity: 0, apdMs: 100, blocked: false },
    { id: 'LA->IA_retro', from: 'IA', to: 'LA', delayMs: 30, delayJitterMs: 0, refractoryMs: 80, amplitude: 0.05, polarity: 0, apdMs: 100, blocked: true },

    // --- 逆方向（逆行性P波・リエントリ用）---
    { id: 'AN->N_retro',   from: 'N',   to: 'AN', delayMs: 10, refractoryMs: 300, amplitude: 0.01, apdMs: 100, reversePathId: 'AN->N' },
    { id: 'N->NH_retro',   from: 'NH',  to: 'N',  delayMs: 20, refractoryMs: 300, amplitude: 0.00, apdMs: 100, reversePathId: 'N->NH' },
    { id: 'His->NH_retro', from: 'His', to: 'NH', delayMs: 42, refractoryMs: 300, amplitude: 0.00, apdMs: 100, reversePathId: 'NH->His' },
    { id: 'A->LA_retro',   from: 'LA',  to: 'A',  delayMs: 42, refractoryMs: 300, amplitude: 0.00, apdMs: 100, reversePathId: 'A->LA', blocked: false }, // AVNRTやMAT逆行性P波対策

    // --- Af loop（リエントリ）---
    { id: 'LA->PV1',  from: 'LA',  to: 'PV1', delayMs: 45, delayJitterMs: 5, refractoryMs: 25, amplitude: 0.1, apdMs: 100, blocked: true },
    { id: 'PV1->PV2', from: 'PV1', to: 'PV2', delayMs: 45, delayJitterMs: 5, refractoryMs: 25, amplitude: 0.1, apdMs: 100, blocked: true },
    { id: 'PV2->LA',  from: 'PV2', to: 'LA',  delayMs: 45, delayJitterMs: 5, refractoryMs: 25, amplitude: 0.1, apdMs: 100, blocked: true },

    // --- AFL loop ---
    { id: 'IA->CTI1',   from: 'IA',   to: 'CTI1', delayMs: 45, delayJitterMs: 5, refractoryMs: 60, amplitude: 0.3, apdMs: 30, blocked: true,  polarity: 0 },
    { id: 'CTI1->CTI2', from: 'CTI1', to: 'CTI2', delayMs: 45, delayJitterMs: 5, refractoryMs: 60, amplitude: 0.2, apdMs: 30, blocked: false, polarity: 0 },
    { id: 'CTI2->CTI3', from: 'CTI2', to: 'CTI3', delayMs: 45, delayJitterMs: 5, refractoryMs: 60, amplitude: 0.1, apdMs: 30, blocked: false, polarity: 0 },
    { id: 'CTI3->IA',   from: 'CTI3', to: 'IA',   delayMs: 45, delayJitterMs: 5, refractoryMs: 60, amplitude: 0.2, apdMs: 30, blocked: false, polarity: 0 },

    //房室伝導
    { id: 'AN->N',   from: 'AN', to: 'N',   delayMs:  5, refractoryMs: 200, amplitude: 0.00, apdMs: 100, reversePathId: 'AN->N_retro', blocked: false },
    { id: 'N->NH',   from: 'N',  to: 'NH',  delayMs: 30, refractoryMs: 250, amplitude: 0.00, apdMs: 100, reversePathId: 'N->NH_retro' },
    { id: 'NH->His', from: 'NH', to: 'His', delayMs:  5, refractoryMs: 200, amplitude: 0.00, apdMs: 100, reversePathId: 'His->NH_retro' },

    //心室不応期を表現するための心室->His伝導//
    { id: 'LV8MAS-His', from: 'LV8MAS', to: 'His', amplitude: 0.0, delayMs: 25, apdMs: 250, refractoryMs: 250},


    // HISープルキンエ
    { id: 'His->LBB', from: 'His', to: 'LBB', delayMs: 3, refractoryMs: 320, amplitude: 0.00, apdMs: 100, },
    { id: 'His->RBB', from: 'His', to: 'RBB', delayMs: 7, refractoryMs: 330, amplitude: 0.00, apdMs: 100 },
    { id: 'LBB->LAF', from: 'LBB', to: 'LAF', delayMs: 4, refractoryMs: 300, amplitude: 0.00, apdMs: 100 },
    { id: 'LBB->LPF', from: 'LBB', to: 'LPF', delayMs: 4, refractoryMs: 310, amplitude: 0.00, apdMs: 100 },

    //LBB -> LV中隔プルキンエ
    { id: 'LBB-PLV2BAS', from: 'LBB', to: 'PLV2BAS', amplitude: 0.0, delayMs: 31, apdMs: 150, refractoryMs: 330 },
    { id: 'LBB-PLV3BS',  from: 'LBB', to: 'PLV3BS',  amplitude: 0.0, delayMs: 31, apdMs: 150, refractoryMs: 330 },
    { id: 'LBB-PLV8MAS', from: 'LBB', to: 'PLV8MAS', amplitude: 0.0, delayMs:  5, apdMs: 150, refractoryMs: 330 },
    { id: 'LBB-PLV9MS',  from: 'LBB', to: 'PLV9MS',  amplitude: 0.0, delayMs:  5, apdMs: 150, refractoryMs: 330 },

    // LAF → 左前枝プルキンエ His-12ms
    { id: 'LAF-PLV7MA',   from: 'LAF', to: 'PLV7MA',   amplitude: 0.0, delayMs: 20, apdMs: 150, refractoryMs: 330 },
    { id: 'LAF-PLV10MI',  from: 'LAF', to: 'PLV10MI',  amplitude: 0.0, delayMs: 20, apdMs: 150, refractoryMs: 330 },
    { id: 'LAF-PLV11MP',  from: 'LAF', to: 'PLV11MP',  amplitude: 0.0, delayMs: 21, apdMs: 150, refractoryMs: 330 },
    { id: 'LAF-PLV12ML',  from: 'LAF', to: 'PLV12ML',  amplitude: 0.0, delayMs: 21, apdMs: 150, refractoryMs: 330 },
    { id: 'LAF-PLV13AA',  from: 'LAF', to: 'PLV13AA',  amplitude: 0.0, delayMs: 21, apdMs: 150, refractoryMs: 330 },
    { id: 'LAF-PLV14AAS', from: 'LAF', to: 'PLV14AAS', amplitude: 0.0, delayMs: 20, apdMs: 150, refractoryMs: 330 },
    { id: 'LAF-PLV15AI',  from: 'LAF', to: 'PLV15AI',  amplitude: 0.0, delayMs: 20, apdMs: 150, refractoryMs: 330 },

    // LPF → 左後枝プルキンエ His-12ms
    { id: 'LPF-PLV1BA',  from: 'LPF', to: 'PLV1BA',  amplitude: 0.0, delayMs: 33, apdMs: 150, refractoryMs: 330 },
    { id: 'LPF-PLV4BI',  from: 'LPF', to: 'PLV4BI',  amplitude: 0.0, delayMs: 33, apdMs: 150, refractoryMs: 330 },
    { id: 'LPF-PLV5BP',  from: 'LPF', to: 'PLV5BP',  amplitude: 0.0, delayMs: 23, apdMs: 150, refractoryMs: 330 },
    { id: 'LPF-PLV6BL',  from: 'LPF', to: 'PLV6BL',  amplitude: 0.0, delayMs: 23, apdMs: 150, refractoryMs: 330 },
    { id: 'LPF-PLV16AP', from: 'LPF', to: 'PLV16AP', amplitude: 0.0, delayMs: 21, apdMs: 150, refractoryMs: 330 },
    { id: 'LPF-PLV17A',  from: 'LPF', to: 'PLV17A',  amplitude: 0.0, delayMs: 21, apdMs: 150, refractoryMs: 330 },

    // RBB → 右室プルキンエ繊維（6本）His-7ms
    { id: 'RBB-PRVB1A', from: 'RBB', to: 'PRVB1A', amplitude: 0.0, delayMs: 31, apdMs: 150, refractoryMs: 330 },
    { id: 'RBB-PRVB2S', from: 'RBB', to: 'PRVB2S', amplitude: 0.0, delayMs: 31, apdMs: 150, refractoryMs: 330 },
    { id: 'RBB-PRVM3A', from: 'RBB', to: 'PRVM3A', amplitude: 0.0, delayMs: 21, apdMs: 150, refractoryMs: 330 },
    { id: 'RBB-PRVM4S', from: 'RBB', to: 'PRVM4S', amplitude: 0.0, delayMs: 17, apdMs: 150, refractoryMs: 330 },
    { id: 'RBB-PRVA5A', from: 'RBB', to: 'PRVA5A', amplitude: 0.0, delayMs: 19, apdMs: 150, refractoryMs: 330 },
    { id: 'RBB-PRVA6S', from: 'RBB', to: 'PRVA6S', amplitude: 0.0, delayMs: 19, apdMs: 150, refractoryMs: 330 },


    //プルキンエ終末ー左室
    { id: 'PLV1BA-LV1BA',   from: 'PLV1BA',  to: 'LV1BA',  amplitude: 0.18, delayMs: 10, apdMs: 180, refractoryMs: 290, polarity: -0.4 },
    { id: 'PLV2BAS-LV2BAS', from: 'PLV2BAS', to: 'LV2BAS', amplitude: 0.30, delayMs: 13, apdMs: 180, refractoryMs: 290, polarity: -0.2 }, //S wave
    { id: 'PLV3BS-LV3BS',   from: 'PLV3BS',  to: 'LV3BS',  amplitude: 0.30, delayMs: 13, apdMs: 180, refractoryMs: 290, polarity: -0.2 }, //S wave
    { id: 'PLV4BI-LV4BI',   from: 'PLV4BI',  to: 'LV4BI',  amplitude: 0.30, delayMs: 13, apdMs: 180, refractoryMs: 290, polarity: -0.2 }, //S wave
    { id: 'PLV5BP-LV5BP',   from: 'PLV5BP',  to: 'LV5BP',  amplitude: 0.30, delayMs: 13, apdMs: 180, refractoryMs: 290, polarity: -0.2 }, //S wave
    { id: 'PLV6BL-LV6BL',   from: 'PLV6BL',  to: 'LV6BL',  amplitude: 0.20, delayMs: 10, apdMs: 180, refractoryMs: 290, polarity: -0.4 },
    { id: 'PLV7MA-LV7MA',   from: 'PLV7MA',  to: 'LV7MA',  amplitude: 0.18, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 },
    { id: 'PLV8MAS-LV8MAS', from: 'PLV8MAS', to: 'LV8MAS', amplitude: 0.35, delayMs: 13, apdMs: 200, refractoryMs: 290, polarity: -0.3 }, //Q wave
    { id: 'PLV9MS-LV9MS',   from: 'PLV9MS',  to: 'LV9MS',  amplitude: 0.35, delayMs: 13, apdMs: 200, refractoryMs: 290, polarity: -0.3 }, //Q wave
    { id: 'PLV10MI-LV10MI', from: 'PLV10MI', to: 'LV10MI', amplitude: 0.20, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 },
    { id: 'PLV11MP-LV11MP', from: 'PLV11MP', to: 'LV11MP', amplitude: 0.20, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 },
    { id: 'PLV12ML-LV12ML', from: 'PLV12ML', to: 'LV12ML', amplitude: 0.17, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 },

    { id: 'PLV13AA-LV13AA',   from: 'PLV13AA',  to: 'LV13AA',  amplitude: 0.17, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 },
    { id: 'PLV14AAS-LV14AAS', from: 'PLV14AAS', to: 'LV14AAS', amplitude: 0.22, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 },
    { id: 'PLV15AI-LV15AI',   from: 'PLV15AI',  to: 'LV15AI',  amplitude: 0.22, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 },
    { id: 'PLV16AP-LV16AP',   from: 'PLV16AP',  to: 'LV16AP',  amplitude: 0.17, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 },

    { id: 'PLV17A-LV17A', from: 'PLV17A', to: 'LV17A', amplitude: 0.10, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.4 },

    // 右室プルキンエ繊維 → 右室筋
    { id: 'PRVB1A-RVB1A', from: 'PRVB1A', to: 'RVB1A', amplitude: 0.12, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.3 },
    { id: 'PRVB2S-RVB2S', from: 'PRVB2S', to: 'RVB2S', amplitude: 0.12, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.3 },
    { id: 'PRVM3A-RVM3A', from: 'PRVM3A', to: 'RVM3A', amplitude: 0.12, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.3 },
    { id: 'PRVM4S-RVM4S', from: 'PRVM4S', to: 'RVM4S', amplitude: 0.12, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.3 },
    { id: 'PRVA5A-RVA5A', from: 'PRVA5A', to: 'RVA5A', amplitude: 0.12, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.3 },
    { id: 'PRVA6S-RVA6S', from: 'PRVA6S', to: 'RVA6S', amplitude: 0.12, delayMs: 10, apdMs: 200, refractoryMs: 290, polarity: -0.3 },

    //心室心室伝導
    //短軸方向
    //Bレベル
    { id: 'LV1BA-LV2BAS', from: 'LV1BA',  to: 'LV2BAS', amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV2BAS-LV1BA' },
    { id: 'LV2BAS-LV3BS', from: 'LV2BAS', to: 'LV3BS',  amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV3BS-LV2BAS' },
    { id: 'LV3BS-LV4BI',  from: 'LV3BS',  to: 'LV4BI',  amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV4BI-LV3BS' },
    { id: 'LV4BI-LV5BP',  from: 'LV4BI',  to: 'LV5BP',  amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV5BP-LV4BI' },
    { id: 'LV5BP-LV6BL',  from: 'LV5BP',  to: 'LV6BL',  amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV6BL-LV5BP' },
    { id: 'LV6BL-LV1BA',  from: 'LV6BL',  to: 'LV1BA',  amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV1BA-LV6BL' },

    // Mレベル（MA-MAS-MS-MI-MP-ML）
    { id: 'LV7MA-LV8MAS', from: 'LV7MA', to: 'LV8MAS', amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV8MAS-LV7MA' },
    //    { id: 'LV8MAS-LV9MS', from: 'LV8MAS', to: 'LV9MS', amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV9MS-LV8MAS' },
    //    { id: 'LV9MS-LV10MI', from: 'LV9MS', to: 'LV10MI', amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV10MI-LV9MS' },
    { id: 'LV10MI-LV11MP', from: 'LV10MI', to: 'LV11MP', amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV11MP-LV10MI' },
    { id: 'LV11MP-LV12ML', from: 'LV11MP', to: 'LV12ML', amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV12ML-LV11MP' },
    { id: 'LV12ML-LV7MA',  from: 'LV12ML', to: 'LV7MA',  amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV7MA-LV12ML' },

    // Aレベル（AA-AAS-AI-AP-A）
    { id: 'LV13AA-LV14AAS', from: 'LV13AA',  to: 'LV14AAS', amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV14AAS-LV13AA' },
    { id: 'LV14AAS-LV15AI', from: 'LV14AAS', to: 'LV15AI',  amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV15AI-LV14AAS' },
    { id: 'LV15AI-LV16AP',  from: 'LV15AI',  to: 'LV16AP',  amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV16AP-LV15AI' },
    { id: 'LV13AA-LV16AP',  from: 'LV13AA',  to: 'LV16AP',  amplitude: 0.0, delayMs: 11, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV16AP-LV13AA' },

    // 左室の逆方向接続
    { id: 'LV2BAS-LV1BA', from: 'LV2BAS', to: 'LV1BA',  amplitude: 0.0, delayMs: 17, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV1BA-LV2BAS' },
    { id: 'LV3BS-LV2BAS', from: 'LV3BS',  to: 'LV2BAS', amplitude: 0.0, delayMs: 17, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV2BAS-LV3BS' },
    { id: 'LV4BI-LV3BS',  from: 'LV4BI',  to: 'LV3BS',  amplitude: 0.0, delayMs: 17, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV3BS-LV4BI' },
    { id: 'LV5BP-LV4BI',  from: 'LV5BP',  to: 'LV4BI',  amplitude: 0.0, delayMs: 17, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV4BI-LV5BP' },
    { id: 'LV6BL-LV5BP',  from: 'LV6BL',  to: 'LV5BP',  amplitude: 0.0, delayMs: 17, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV5BP-LV6BL' },
    { id: 'LV1BA-LV6BL',  from: 'LV1BA',  to: 'LV6BL',  amplitude: 0.0, delayMs: 17, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV6BL-LV1BA' },

    //    { id: 'LV8MAS-LV7MA', from: 'LV8MAS', to: 'LV7MA', amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV7MA-LV8MAS' },
    //    { id: 'LV9MS-LV8MAS', from: 'LV9MS', to: 'LV8MAS', amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV8MAS-LV9MS' },
    { id: 'LV10MI-LV9MS',  from: 'LV10MI', to: 'LV9MS',  amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV9MS-LV10MI' },
    { id: 'LV11MP-LV10MI', from: 'LV11MP', to: 'LV10MI', amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV10MI-LV11MP' },
    { id: 'LV12ML-LV11MP', from: 'LV12ML', to: 'LV11MP', amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV11MP-LV12ML' },
    { id: 'LV7MA-LV12ML',  from: 'LV7MA',  to: 'LV12ML', amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV12ML-LV7MA' },

    { id: 'LV14AAS-LV13AA', from: 'LV14AAS', to: 'LV13AA',  amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV13AA-LV14AAS' },
    { id: 'LV15AI-LV14AAS', from: 'LV15AI',  to: 'LV14AAS', amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV14AAS-LV15AI' },
    { id: 'LV16AP-LV15AI',  from: 'LV16AP',  to: 'LV15AI',  amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV15AI-LV16AP' },
    { id: 'LV16AP-LV13AA',  from: 'LV13AA',  to: 'LV16AP',  amplitude: 0.0, delayMs: 13, apdMs: 270, refractoryMs: 300, polarity: 0.0, priority: 2, reversePathId: 'LV13AA-LV16AP' },

    //長軸方向
    // LV1BA-LV7MA-LV13AA
    { id: 'LV1BA-LV7MA',  from: 'LV1BA',  to: 'LV7MA',  amplitude: 0.05, delayMs: 37, apdMs: 230, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV7MA-LV1BA' },
    { id: 'LV7MA-LV1BA',  from: 'LV7MA',  to: 'LV1BA',  amplitude: 0.05, delayMs: 37, apdMs: 230, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV1BA-LV7MA' },
    { id: 'LV7MA-LV13AA', from: 'LV7MA',  to: 'LV13AA', amplitude: 0.05, delayMs: 31, apdMs: 230, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV13AA-LV7MA' },
    { id: 'LV13AA-LV7MA', from: 'LV13AA', to: 'LV7MA',  amplitude: 0.05, delayMs: 31, apdMs: 230, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV7MA-LV13AA' },

    // LV2BAS-LV8MAS-LV14AAS
    { id: 'LV2BAS-LV8MAS', from: 'LV2BAS', to: 'LV8MAS', amplitude: 0.4, delayMs: 37, apdMs: 270, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV8MAS-LV2BAS' },
    //    { id: 'LV8MAS-LV2BAS', from: 'LV8MAS', to: 'LV2BAS', amplitude: 0.19, delayMs: 37, apdMs: 270, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'LV2BAS-LV8MAS' },
    //    { id: 'LV8MAS-LV14AAS', from: 'LV8MAS', to: 'LV14AAS', amplitude: 0.17, delayMs: 31, apdMs: 270, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'LV14AAS-LV8MAS' },
    { id: 'LV14AAS-LV8MAS', from: 'LV14AAS', to: 'LV8MAS', amplitude: 0.3, delayMs: 31, apdMs: 270, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV8MAS-LV14AAS' },

    // LV3BS-LV9MS
    { id: 'LV3BS-LV9MS', from: 'LV3BS', to: 'LV9MS', amplitude: 0.4, delayMs: 37, apdMs: 270, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV9MS-LV3BS' },
    //    { id: 'LV9MS-LV3BS', from: 'LV9MS', to: 'LV3BS', amplitude: 0.04, delayMs: 31, apdMs: 270, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'LV3BS-LV9MS' },

    // LV4BI-LV10MI-LV15AI
    { id: 'LV4BI-LV10MI',  from: 'LV4BI',  to: 'LV10MI', amplitude: 0.04, delayMs: 31, apdMs: 230, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV10MI-LV4BI' },
    { id: 'LV10MI-LV4BI',  from: 'LV10MI', to: 'LV4BI',  amplitude: 0.04, delayMs: 31, apdMs: 230, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV4BI-LV10MI' },
    { id: 'LV10MI-LV15AI', from: 'LV10MI', to: 'LV15AI', amplitude: 0.04, delayMs: 23, apdMs: 230, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV15AI-LV10MI' },
    { id: 'LV15AI-LV10MI', from: 'LV15AI', to: 'LV10MI', amplitude: 0.04, delayMs: 23, apdMs: 230, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV10MI-LV15AI' },

    // LV5BP-LV11MP-LV16AP
    { id: 'LV5BP-LV11MP',  from: 'LV5BP',  to: 'LV11MP', amplitude: 0.04, delayMs: 31, apdMs: 210, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV11MP-LV5BP' },
    { id: 'LV11MP-LV5BP',  from: 'LV11MP', to: 'LV5BP',  amplitude: 0.04, delayMs: 31, apdMs: 210, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV5BP-LV11MP' },
    { id: 'LV11MP-LV16AP', from: 'LV11MP', to: 'LV16AP', amplitude: 0.03, delayMs: 23, apdMs: 210, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV16AP-LV11MP' },
    { id: 'LV16AP-LV11MP', from: 'LV16AP', to: 'LV11MP', amplitude: 0.03, delayMs: 23, apdMs: 210, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV11MP-LV16AP' },

    //LV6BL-LV12ML
    { id: 'LV6BL-LV12ML', from: 'LV6BL', to: 'LV12ML', amplitude: 0.04, delayMs: 31, apdMs: 210, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV12ML-LV6BL' },
    { id: 'LV12ML-LV6BL', from: 'LV12ML', to: 'LV6BL', amplitude: 0.03, delayMs: 23, apdMs: 210, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'LV6BL-LV12ML' },

    //a -apex
    { id: 'LV13AA-LV17A',  from: 'LV13AA',  to: 'LV17A', amplitude: 0.02, delayMs: 19, apdMs: 210, refractoryMs: 300, polarity: 0.4, priority: 2, reversePathId: 'LV17A-LV13AA' },
    { id: 'LV14AAS-LV17A', from: 'LV14AAS', to: 'LV17A', amplitude: 0.02, delayMs: 19, apdMs: 210, refractoryMs: 300, polarity: 0.4, priority: 2, reversePathId: 'LV17A-LV14AAS' },
    { id: 'LV15AI-LV17A',  from: 'LV15AI',  to: 'LV17A', amplitude: 0.01, delayMs: 17, apdMs: 210, refractoryMs: 300, polarity: 0.4, priority: 2, reversePathId: 'LV17A-LV15AI' },
    { id: 'LV16AP-LV17A',  from: 'LV16AP',  to: 'LV17A', amplitude: 0.01, delayMs: 17, apdMs: 210, refractoryMs: 300, polarity: 0.4, priority: 2, reversePathId: 'LV17A-LV16AP' },

    //a -apex
    { id: 'LV17A-LV13AA',  from: 'LV17A', to: 'LV13AA',  amplitude: 0.01, delayMs: 31, apdMs: 210, refractoryMs: 300, polarity: 0.4, priority: 2, reversePathId: 'LV13AA-LV17A' },
    { id: 'LV17A-LV14AAS', from: 'LV17A', to: 'LV14AAS', amplitude: 0.01, delayMs: 31, apdMs: 210, refractoryMs: 300, polarity: 0.4, priority: 2, reversePathId: 'LV14AAS-LV17A' },
    { id: 'LV17A-LV15AI',  from: 'LV17A', to: 'LV15AI',  amplitude: 0.01, delayMs: 29, apdMs: 210, refractoryMs: 300, polarity: 0.4, priority: 2, reversePathId: 'LV15AI-LV17A' },
    { id: 'LV17A-LV16AP',  from: 'LV17A', to: 'LV16AP',  amplitude: 0.01, delayMs: 29, apdMs: 210, refractoryMs: 300, polarity: 0.4, priority: 2, reversePathId: 'LV16AP-LV17A' },


    // 右室の接続
    { id: 'RVB1A-RVB2S', from: 'RVB1A', to: 'RVB2S', amplitude: 0.0, delayMs: 13, apdMs: 210, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'RVB2S-RVB1A' },
    { id: 'RVB2S-RVB1A', from: 'RVB2S', to: 'RVB1A', amplitude: 0.0, delayMs: 13, apdMs: 210, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'RVB1A-RVB2S' },
    { id: 'RVM3A-RVM4S', from: 'RVM3A', to: 'RVM4S', amplitude: 0.0, delayMs: 11, apdMs: 210, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'RVM4S-RVM3A' },
    { id: 'RVM4S-RVM3A', from: 'RVM4S', to: 'RVM3A', amplitude: 0.0, delayMs: 11, apdMs: 210, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'RVM3A-RVM4S' },
    { id: 'RVA5A-RVA6S', from: 'RVA5A', to: 'RVA6S', amplitude: 0.0, delayMs: 11, apdMs: 210, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'RVA6S-RVA5A' },
    { id: 'RVA6S-RVA5A', from: 'RVA6S', to: 'RVA5A', amplitude: 0.0, delayMs: 11, apdMs: 210, refractoryMs: 300, polarity: 0.5, priority: 2, reversePathId: 'RVA5A-RVA6S' },

    // 右室と左室のAnterior接続
    { id: 'RVB1A-LV2BAS',  from: 'RVB1A',   to: 'LV2BAS', amplitude: 0.0, delayMs: 19, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'LV2BAS-RVB1A' },
    { id: 'LV2BAS-RVB1A',  from: 'LV2BAS',  to: 'RVB1A', amplitude: 0.0, delayMs: 19, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVB1A-LV2BAS' },
    { id: 'RVM3A-LV8MAS',  from: 'RVM3A',  to: 'LV8MAS', amplitude: 0.0, delayMs: 17, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'LV8MAS-RVM3A' },
    //{ id: 'LV8MAS-RVM3A', from: 'LV8MAS', to: 'RVM3A', amplitude: 0.0, delayMs: 17, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVM3A-LV8MAS' },
    { id: 'RVA5A-LV14AAS', from: 'RVA5A',   to: 'LV14AAS', amplitude: 0.0, delayMs: 13, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'LV14AAS-RVA5A' },
    { id: 'LV14AAS-RVA5A', from: 'LV14AAS', to: 'RVA5A', amplitude: 0.0, delayMs: 13, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVA5A-LV14AAS' },

    // 右室と左室のSeptal接続
    { id: 'RVB2S-LV3BS', from: 'RVB2S', to: 'LV3BS', amplitude: 0.0, delayMs: 19, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'LV3BS-RVB2S' },
    { id: 'LV3BS-RVB2S', from: 'LV3BS', to: 'RVB2S', amplitude: 0.0, delayMs: 19, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVB2S-LV3BS' },
    { id: 'RVM4S-LV9MS', from: 'RVM4S', to: 'LV9MS', amplitude: 0.0, delayMs: 17, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'LV9MS-RVM4S' },
    //    { id: 'LV9MS-RVM4S', from: 'LV9MS', to: 'RVM4S', amplitude: 0.0, delayMs: 17, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVM4S-LV9MS' },
    { id: 'RVA6S-LV15AI', from: 'RVA6S', to: 'LV15AI', amplitude: 0.0, delayMs: 13, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'LV15AI-RVA6S' },
    { id: 'LV15AI-RVA6S', from: 'LV15AI', to: 'RVA6S', amplitude: 0.0, delayMs: 13, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVA6S-LV15AI' },

    // 右室の長軸伝導
    { id: 'RVB1A-RVM3A', from: 'RVB1A', to: 'RVM3A', amplitude: 0.05, delayMs: 29, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVM3A-RVB1A' },
    { id: 'RVM3A-RVA5A', from: 'RVM3A', to: 'RVA5A', amplitude: 0.05, delayMs: 23, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVA5A-RVM3A' },
    { id: 'RVB2S-RVM4S', from: 'RVB2S', to: 'RVM4S', amplitude: 0.05, delayMs: 29, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVM4S-RVB2S' },
    { id: 'RVM4S-RVA6S', from: 'RVM4S', to: 'RVA6S', amplitude: 0.05, delayMs: 23, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVA6S-RVM4S' },

    // 右室の長軸伝導
    { id: 'RVM3A-RVB1A', from: 'RVM3A', to: 'RVB1A', amplitude: 0.05, delayMs: 29, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVB1A-RVM3A' },
    { id: 'RVA5A-RVM3A', from: 'RVA5A', to: 'RVM3A', amplitude: 0.05, delayMs: 23, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVM3A-RVA5A' },
    { id: 'RVM4S-RVB2S', from: 'RVM4S', to: 'RVB2S', amplitude: 0.05, delayMs: 29, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVB2S-RVM4S' },
    { id: 'RVA6S-RVM4S', from: 'RVA6S', to: 'RVM4S', amplitude: 0.05, delayMs: 23, apdMs: 210, refractoryMs: 300, polarity: 0.3, priority: 2, reversePathId: 'RVM4S-RVA6S' }

  ];
}
