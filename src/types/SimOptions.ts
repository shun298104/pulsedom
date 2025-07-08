// src/types/SimOptions.ts
import { graphControlRules, getDefaultOptionsFromRules } from '../rules/graphControlRuleList';
import { PULSEDOM_VERSION } from '../constants/version';

export type RawSimOptions = {
  hr: number;
  rr: number;
  spo2: number;
  pi: number; // パルス振幅（オプション）
  nibp_sys?: number;
  nibp_dia?: number;
  etco2?: number;
  respRate?: number; // 呼吸数（オプション）

  sinus_rate: number;
  junction_rate: number;
  ventricle_rate: number;

  options: Record<string, string | number>;
  version?: string;

  pacing?: {
    mode: 'OFF' | 'AOO' | 'VOO' | 'VVI' | 'DDD';
    lowerRateLimit: number;
    upperRateLimit: number;
    avDelay: number;
  };
  conductionRate?: string;
  status?: Record<string, string>;
};

export class SimOptions {

  constructor(raw: RawSimOptions | SimOptions) {
    let status =
      "getRaw" in raw
        ? (raw as SimOptions).status
        : (raw as RawSimOptions).status;

    if (!status) {
      status = {
        sinus_status: 'NSR',
        junction_status: 'Normal',
        conduction_status: 'Normal',
        ventricle_status: 'Normal',
      };
    }

    if ("getRaw" in raw) {
      this.rawData = raw.getRaw();
    } else {
      this.rawData = raw;
    }
    this.status = { ...status };
  }
  private rawData: RawSimOptions;
  private status: Record<string, string> = {};

  getRaw(): RawSimOptions {
    return {
      version: PULSEDOM_VERSION,
      ...this.rawData,
      status: { ...this.status },
    };
  }

  clone(): SimOptions {
    const cloned = new SimOptions(this.getRaw());
    cloned.status = { ...this.status };
    return cloned;
  }

  getOption(key: string): string | number | undefined {
    return this.rawData.options?.[key];
  }

  setOption(key: string, value: string | number) {
    if (!this.rawData.options) this.rawData.options = {};
    this.rawData.options[key] = value;
  }

  setExtendedOption(status: string, key: string, value: string | number) {
    const fullKey = `${status.toLowerCase()}.${key}`;
    this.setOption(fullKey, value);
  }

  getOptionsForStatus(status: string): Record<string, string | number> {
    const result: Record<string, string | number> = {};
    if (!this.rawData.options) return result;

    const prefix = status.toLowerCase() + ".";
    for (const [key, val] of Object.entries(this.rawData.options)) {
      if (key.toLowerCase().startsWith(prefix)) {
        result[key.slice(prefix.length)] = val;
      }
    }
    return result;
  }

  public setStatus(group: string, id: string): void {
    this.status[group] = id;
  }

  /** statusを取得（UI用） */
  public getStatus(group: string): string | undefined {
    return this.status[group];
  }
  /** statusesを取得（GC用） */
  get statuses(): string[] {
    return Object.values(this.status).filter((s): s is string => !!s);
  }

  get hr() { return this.rawData.hr; }
  set hr(val: number) { this.rawData.hr = val; }

  get spo2(): number { return this.rawData.spo2 ?? 98; }
  set spo2(val: number) { this.rawData.spo2 = val; }

  get pi(): number { return this.rawData.pi ?? 0.2; }
  set pi(val: number) { this.rawData.pi = val; }

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

  get etco2(): number | undefined { return this.rawData.etco2; }
  set etco2(val: number | undefined) { this.rawData.etco2 = val; }

  get respRate(): number | undefined { return this.rawData.respRate; }
  set respRate(val: number | undefined) { this.rawData.respRate = val; }
}

export function createDefaultSimOptions(): SimOptions {
  const defaultOptions = getDefaultOptionsFromRules(graphControlRules);
  return new SimOptions({
    hr: 80,
    rr: 750,
    spo2: 98,
    pi: 2,
    nibp_sys: 120,
    nibp_dia: 80,
    etco2: 38,
    respRate: 12,
    sinus_rate: 80,
    junction_rate: 40,
    ventricle_rate: 30,

    options: defaultOptions,

    pacing: {
      mode: 'OFF',
      lowerRateLimit: 50,
      upperRateLimit: 120,
      avDelay: 120,
    },
    status: {
      sinus_status: 'NSR',
      junction_status: 'Normal',
      conduction_status: 'Normal',
      ventricle_status: 'Normal',
    }
  });
}

export default createDefaultSimOptions;
