import { PathProps } from './Path';

export function createDefaultPaths(): PathProps[] {
  return [
    // --- 正方向（順行P波 + AV伝導 + 心室）---
    { id: 'SA->CT',      from: 'SA',  to: 'CT',  delayMs: 10,  refractoryMs: 250, amplitude: 0.00, apdMs: 100 },
    { id: 'CT->A',       from: 'CT',  to: 'A',   delayMs: 5,   refractoryMs: 250, amplitude: 0.00, apdMs: 100 },
    { id: 'A->IA',       from: 'A',   to: 'IA',  delayMs: 70,  refractoryMs: 250, amplitude: 0.08, apdMs: 100, reversePathId: 'A->IA_retro' },
    { id: 'IA->AN_fast', from: 'IA',  to: 'AN',  delayMs: 15,  refractoryMs: 250, amplitude: 0.02, apdMs: 100, 
      conductionProbability: 1, reversePathId: 'IA->AN_fast_retro' },
    { id: 'IA->AN_slow', from: 'IA',  to: 'AN',  delayMs: 100, refractoryMs: 250, amplitude: 0.02, apdMs: 100,
      conductionProbability: 1, reversePathId: 'IA->AN_slow_retro' },
    { id: 'AN->N',       from: 'AN',  to: 'N',   delayMs: 5,  refractoryMs: 250, amplitude: 0.00, apdMs: 100, reversePathId: 'AN->N_retro' },
    { id: 'N->NH',       from: 'N',   to: 'NH',  delayMs: 40,  refractoryMs: 250, amplitude: 0.00, apdMs: 100, reversePathId: 'N->NH_retro' },
    { id: 'NH->His',     from: 'NH',  to: 'His', delayMs: 5,  refractoryMs: 250, amplitude: 0.00, apdMs: 100, reversePathId: 'His->NH_retro' },
//    { id: 'His->V',      from: 'His', to: 'V',   delayMs: 10,  refractoryMs: 250, amplitude: 0.01, apdMs: 250 },

    // --- 逆方向（逆行性P波・リエントリ用）---
    { id: 'A->IA_retro',       from: 'IA',  to: 'A',  delayMs: 60,  refractoryMs: 250, amplitude: 0.07, apdMs: 100, reversePathId: 'A->IA' },
    { id: 'IA->AN_fast_retro', from: 'AN',  to: 'IA', delayMs: 40,  refractoryMs: 300, amplitude: 0.02, apdMs: 100, reversePathId: 'IA->AN_fast' },
    { id: 'IA->AN_slow_retro', from: 'AN',  to: 'IA', delayMs: 100, refractoryMs: 400, amplitude: 0.02, apdMs: 100, reversePathId: 'IA->AN_slow' },
    { id: 'AN->N_retro',       from: 'N',   to: 'AN', delayMs: 10,  refractoryMs: 250, amplitude: 0.01, apdMs: 100, reversePathId: 'AN->N' },
    { id: 'N->NH_retro',       from: 'NH',  to: 'N',  delayMs: 20,  refractoryMs: 300, amplitude: 0.00, apdMs: 100, reversePathId: 'N->NH' },
    { id: 'His->NH_retro',     from: 'His', to: 'NH', delayMs: 40,  refractoryMs: 250, amplitude: 0.00, apdMs: 100, reversePathId: 'NH->His' },
    { id: 'A->LA_retro',       from: 'LA',  to: 'A',  delayMs: 40,  refractoryMs: 250, amplitude: 0.00, apdMs: 100, reversePathId: 'A->LA', blocked: true }, // AVNRTやMAT逆行性P波対策

    // --- 心房末端 + LA経由 ---
    { id: 'A->LA',  from: 'A',  to: 'LA', delayMs: 80, refractoryMs: 250, amplitude: 0.07, apdMs: 100 },
    { id: 'LA->IA', from: 'LA', to: 'IA', delayMs: 80, refractoryMs: 250, amplitude: 0.03, apdMs: 100, blocked: true  },

    // --- Af loop（リエントリ）---
    { id: 'LA->PV1',  from: 'LA',  to: 'PV1', delayMs: 22, delayJitterMs: 7, refractoryMs: 50, amplitude: 0.018, apdMs: 100, blocked: true },
    { id: 'PV1->PV2', from: 'PV1', to: 'PV2', delayMs: 22, delayJitterMs: 7, refractoryMs: 50, amplitude: 0.018, apdMs: 100, blocked: true  },
    { id: 'PV2->LA',  from: 'PV2', to: 'LA',  delayMs: 22, delayJitterMs: 7, refractoryMs: 50, amplitude: 0.018, apdMs: 100, blocked: true  },

    // --- AFL loop ---
    { id: 'IA->CTI2', from: 'IA',   to: 'CTI2', delayMs: 100, refractoryMs: 80, amplitude: 0.04, apdMs: 100, blocked: true  },
    { id: 'CTI2->IA', from: 'CTI2', to: 'IA'  , delayMs: 90,  refractoryMs: 80, amplitude: 0.04, apdMs: 100, blocked: true  },

    // 心室伝導
    { id: 'His->LBB', from: 'His', to: 'LBB', delayMs: 20, refractoryMs: 250, amplitude: 0.00, apdMs: 100},
    { id: 'His->RBB', from: 'His', to: 'RBB', delayMs: 15, refractoryMs: 250, amplitude: 0.00, apdMs: 100},

    { id: 'RBB->V_sep', from: 'RBB', to: 'V_sep', delayMs: 15, refractoryMs: 250, amplitude: 0.15, apdMs: 175},
    { id: 'V_sep->RV', from: 'V_sep', to: 'RV', delayMs: 10, refractoryMs: 250, amplitude: 0.4, apdMs: 175},
    { id: 'LBB->LV_main', from: 'LBB', to: 'LV_main', delayMs: 10, refractoryMs: 250, amplitude: 0.7, apdMs: 175},

  ];
}
