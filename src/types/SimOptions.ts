// src/types/SimOptions.ts
import { NodeId } from '../types/NodeTypes';

export type RawSimOptions = {
//  statuses: string[];
  hr: number;
  rr: number;
  spo2: number;
  nibp_sys?: number;
  nibp_dia?: number;

  sinus_rate: number;
  junction_rate: number;
  ventricle_rate: number;

  sinus_status?: string;
  junction_status?: string;
  ventricle_status?: string;

  pacing?: {
    mode: 'OFF' | 'AOO' | 'VOO' | 'VVI' | 'DDD';
    lowerRateLimit: number;
    upperRateLimit: number;
    avDelay: number;
  };

  conductionRate?: string;
};

export class SimOptions {
  constructor(raw: RawSimOptions | SimOptions) {
    if (raw instanceof SimOptions) {
      // SimOptionsからのコピー
      this.rawData = raw.getRaw();
    } else {
      this.rawData = raw;
    }
  }

  private rawData: RawSimOptions;

  getRaw(): RawSimOptions {
    return structuredClone(this.rawData);
  }

  get hr() { return this.rawData.hr; }
  set hr(val: number) { this.rawData.hr = val; }

  get rr() { return this.rawData.rr; }
  set rr(val: number) { this.rawData.rr = val; }

  get spo2(): number { return this.rawData.spo2; }
  set spo2(value: number) { this.rawData.spo2 = value; }

  get sysBp(): number { return this.rawData.nibp_sys ?? 120; }
  set sysBp(val: number) { this.rawData.nibp_sys = val; }

  get diaBp(): number { return this.rawData.nibp_dia ?? 80; }
  set diaBp(val: number) { this.rawData.nibp_dia = val; }

  get sinusRate() { return this.rawData.sinus_rate; }
  set sinusRate(val: number) { this.rawData.sinus_rate = val; }

  get junctionRate() { return this.rawData.junction_rate; }
  set junctionRate(val: number) { this.rawData.junction_rate = val; }

  get ventricleRate() { return this.rawData.ventricle_rate; }
  set ventricleRate(val: number) { this.rawData.ventricle_rate = val; }

  get pacing() { return this.rawData.pacing; }

  getRate(nodeId: NodeId): number {
    switch (nodeId) {
      case 'SA': return this.rawData.sinus_rate;
      case 'NH': return this.rawData.junction_rate;
      case 'V': return this.rawData.ventricle_rate;
      default: return 0;
    }
  }
  set sinus_status(val: string | undefined) { this.rawData.sinus_status = val; }

  get sinus_status(): string | undefined { return this.rawData.sinus_status; }
  get junction_status(): string | undefined { return this.rawData.junction_status; }
  get ventricle_status(): string | undefined { return this.rawData.ventricle_status; }

  get statuses(): string[] {
    return [
      this.sinus_status,
      this.junction_status,
      this.ventricle_status,
    ].filter((s): s is string => !!s);
  }
}

export function createDefaultSimOptions(): SimOptions {
  return new SimOptions({
    statuses: ["AtrialNormal"],
    hr: 80,
    rr: 750,
    spo2: 98,
    nibp_sys: 120,
    nibp_dia: 80,
    sinus_rate: 80,
    junction_rate: 40,
    ventricle_rate: 30,

    pacing: {
      mode: 'OFF',
      lowerRateLimit: 50,
      upperRateLimit: 120,
      avDelay: 120,
    },
  });
}

export default createDefaultSimOptions;
