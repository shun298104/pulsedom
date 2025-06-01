// src/models/VitalParameter.ts
import { RawSimOptions } from "./SimOptions";

export interface AlarmLimits {
  warnLow: number;
  warnHigh: number;
  critLow: number;
  critHigh: number;
}

export class VitalParameter {
  label: string;
  unit: string;
  min: number;
  max: number;
  decimals: number;
  alarm: AlarmLimits;
  color: string = 'text-white';
  key: keyof RawSimOptions;

  constructor({
    label,
    unit,
    min,
    max,
    decimals = 0,
    alarm,
    color,
    key,
  }: {
    label: string;
    unit: string;
    min: number;
    max: number;
    decimals?: number;
    alarm?: AlarmLimits;
    color?: string;
    key: keyof RawSimOptions;
  }) {
    this.label = label;
    this.unit = unit;
    this.min = min;
    this.max = max;
    this.decimals = decimals;
    this.alarm = alarm ?? { warnLow: 0, warnHigh: 100, critLow: 0, critHigh: 100, };
    this.color = color || 'text-white'; // デフォルト色
    this.key = key;
  }

  clamp(value: number): number {
    return Math.min(this.max, Math.max(this.min, value));
  }

  format(value: unknown): string {
    if (typeof value !== 'number' || !isFinite(value) || value < 0) {
      return '--'; // 未決定や不正値は "--" にする（明示的）
    }
    return value.toFixed(this.decimals);
  }

  getStatus(value: number): {
    level: 'normal' | 'warning' | 'critical';
    bound: 'low' | 'high' | null;
  } {
    if (value < this.alarm.critLow) return { level: 'critical', bound: 'low' };
    if (value > this.alarm.critHigh) return { level: 'critical', bound: 'high' };
    if (value < this.alarm.warnLow) return { level: 'warning', bound: 'low' };
    if (value > this.alarm.warnHigh) return { level: 'warning', bound: 'high' };
    return { level: 'normal', bound: null };
  }

  isCritical(value: number): boolean {
    return value < this.alarm.critLow || value > this.alarm.critHigh;
  }
  isWarning(value: number): boolean {
    return (
      (value < this.alarm.warnLow && value >= this.alarm.critLow) ||
      (value > this.alarm.warnHigh && value <= this.alarm.critHigh)
    );
  }

  getColor(): string {
    return this.color || 'text-white';
  }

}


export const HR_PARAM = new VitalParameter({
  key: 'hr',
  label: 'HR',
  unit: '/min',
  min: 5,
  max: 250,
  decimals: 0,
  color: 'text-green-400',

  alarm: {
    warnLow: 50,
    warnHigh: 120,
    critLow: 30,
    critHigh: 180,
  },
});

export const SPO2_PARAM = new VitalParameter({
  key: 'spo2',
  label: 'SpO2',
  unit: '%',
  min: 0,
  max: 100,
  decimals: 0,
  color: 'text-cyan-400',

  alarm: {
    warnLow: 90,
    warnHigh: 100,
    critLow: 80,
    critHigh: 100,
  },
});

export const NIBP_SYS_PARAM = new VitalParameter({
  key: 'nibp_sys',
  label: 'SysBP',
  unit: 'mmHg',
  min: 30,
  max: 250,
  decimals: 0,
  alarm: {
    warnLow: 80,
    warnHigh: 160,
    critLow: 0,
    critHigh: 300,
  },
  color: 'text-orange-400',
});

export const NIBP_DIA_PARAM = new VitalParameter({
  key: 'nibp_dia',
  label: 'DiaBP',
  unit: 'mmHg',
  min: 20,
  max: 250,
  decimals: 0,
  alarm: {
    warnLow: 40,
    warnHigh: 120,
    critLow: 0,
    critHigh: 300,
  },
  color: 'text-orange-400',
});

export type VitalKey = 'hr' | 'spo2' | 'nibp_sys' | 'nibp_dia';

export const vitalParameterMap: Record<string, VitalParameter> = {
  hr: HR_PARAM,
  spo2: SPO2_PARAM,
  nibp_sys: NIBP_SYS_PARAM,
  nibp_dia: NIBP_DIA_PARAM,
};