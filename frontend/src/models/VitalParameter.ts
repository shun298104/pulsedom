// src/models/VitalParameter.ts

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
    sensitivity: number; 
    alarm: AlarmLimits;
  
    constructor({
        label,
        unit,
        min,
        max,
        decimals = 0,
        sensitivity = 1,  // ← ★コレ！！
        alarm,
    }: {
        label: string;
        unit: string;
        min: number;
        max: number;
        decimals?: number;
        sensitivity?: number; // ← ★コレ！！
        alarm: AlarmLimits;
    }) {
        this.label = label;
        this.unit = unit;
        this.min = min;
        this.max = max;
        this.decimals = decimals;
        this.sensitivity = sensitivity; // ← ★コレ！！
        this.alarm = alarm;
    }
  
    clamp(value: number): number {
      return Math.min(this.max, Math.max(this.min, value));
    }
  
    format(value: number): string {
      return value.toFixed(this.decimals);
    }
  
    getStatus(value: number): 'normal' | 'warn' | 'critical' {
      if (value <= this.alarm.critLow || value >= this.alarm.critHigh) return 'critical';
      if (value <= this.alarm.warnLow || value >= this.alarm.warnHigh) return 'warn';
      return 'normal';
    }

    isCritical(value: number): boolean {
        return value <= this.alarm.critLow || value >= this.alarm.critHigh;
    }
    isWarning(value: number): boolean {
    return (
        (value <= this.alarm.warnLow && value > this.alarm.critLow) ||
        (value >= this.alarm.warnHigh && value < this.alarm.critHigh)
    );
    }

    getColor(): string {
    return 'text-white'; // デフォルト色（必要に応じて拡張）
    }

  }
  
  export const HR_PARAM = new VitalParameter({
    label: 'HR',
    unit: '',
    min: 20,
    max: 250,
    decimals: 0,
    sensitivity: 1, // 👈

    alarm: {
      warnLow: 50,
      warnHigh: 120,
      critLow: 30,
      critHigh: 180,
    },
  });
  
  export const SPO2_PARAM = new VitalParameter({
    label: 'SpO2',
    unit: '%',
    min: 0,
    max: 100,
    decimals: 0,
    sensitivity: 1, // 👈
    alarm: {
      warnLow: 90,
      warnHigh: 100,
      critLow: 85,
      critHigh: 101,
    },
  });
