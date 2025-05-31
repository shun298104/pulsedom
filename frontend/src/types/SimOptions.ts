// src/types/SimOptions.ts
import { NodeId } from '../types/NodeTypes';
import { ruleMap } from '../rules/graphControlRuleList';
import { graphControlRules, getDefaultOptionsFromRules } from '../rules/graphControlRuleList';

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
  conduction_status?: string;

  options: Record<string, string | number>;

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
      this.rawData = raw.getRaw();
    } else {
      this.rawData = raw;
    }
  }

  private rawData: RawSimOptions;
  private status: Record<string, string> = {};

  getRaw(): RawSimOptions {
    return { ...this.rawData }; // ← shallow copyに変更
  }

  getOption(key: string): string | number | undefined {
    return this.rawData.options?.[key];
  }

  setOption(key: string, value: string | number) {
    if (!this.rawData.options) this.rawData.options = {};
    this.rawData.options[key] = value;
  }

  setExtendedOption(status: string, key: string, value: string | number) {
    const fullKey = `${status.toLowerCase()}.${key}`; // ✅ prefixだけ小文字
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

  clone(): SimOptions {
    const cloned = new SimOptions(this.getRaw());
    cloned.status = { ...this.status };  // ← これが必要！
    return cloned;
  }

  public setStatus(group: string, id: string): void {
    this.status[group] = id;
  }

  /** 排他グループ処理を含む安全なセット（上書き） 使ってないけど念のため*/
  public pushStatus(group: string, id: string): void {
    const rule = ruleMap[id];
    if (!rule) return;

    // 排他グループを持つ場合、競合するstatusを削除
    if (rule.exclusiveGroup) {
      for (const key in this.status) {
        const currentRule = ruleMap[this.status[key]];
        if (currentRule?.exclusiveGroup === rule.exclusiveGroup) {
          delete this.status[key];
        }
      }
    }

    this.status[group] = id;
  }

  /** statusを取得（UI用） */
  public getStatus(group: string): string | undefined {
    return this.status[group];
  }
  get statuses(): string[] {
    return Object.values(this.status).filter((s): s is string => !!s);
  }

  get hr() { return this.rawData.hr; }
  set hr(val: number) { this.rawData.hr = val; }

  get spo2(): number { return this.rawData.spo2 ?? 98; }
  set spo2(val: number) { this.rawData.spo2 = val; }

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

  set sinus_status(val: string | undefined) { this.rawData.sinus_status = val; }
  set junction_status(val: string | undefined) { this.rawData.junction_status = val; }
  set ventricle_status(val: string | undefined) { this.rawData.ventricle_status = val; }
  set conduction_status(val: string | undefined) { this.rawData.conduction_status = val; }

  get sinus_status(): string | undefined { return this.rawData.sinus_status; }
  get junction_status(): string | undefined { return this.rawData.junction_status; }
  get ventricle_status(): string | undefined { return this.rawData.ventricle_status; }
  get conduction_status(): string | undefined { return this.rawData.conduction_status; }

}

export function createDefaultSimOptions(): SimOptions {
  const defaultOptions = getDefaultOptionsFromRules(graphControlRules);
  return new SimOptions({
    hr: 80,
    rr: 750,
    spo2: 98,
    nibp_sys: 120,
    nibp_dia: 80,
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
  });
}

export default createDefaultSimOptions;
