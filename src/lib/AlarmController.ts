// src/lib/AlarmController.ts

import { VitalParameter, vitalParameterMap, VitalKey } from '../types/VitalParameter';
import { RawSimOptions } from '../types/SimOptions';

export type AlarmLevel = 'normal' | 'warning' | 'critical';

export interface AlarmResult {
    level: AlarmLevel;
    messages: string[];
    shouldPlay: boolean;
    primaryWarningKey?: VitalKey;
    activeWarningKeys?: VitalKey[];
}

export class AlarmController {
    private lastTriggerAt: number = 0;
    private muteUntil: Record<AlarmLevel, number | null> = {
        normal: null,
        warning: null,
        critical: null,
    };
    private lastLevel: AlarmLevel = 'normal';
    private lastStatuses: Record<VitalKey, { level: AlarmLevel; bound: 'low' | 'high' | null }> = {
        hr: { level: 'normal', bound: null },
        spo2: { level: 'normal', bound: null },
        nibp_sys: { level: 'normal', bound: null },
        nibp_dia: { level: 'normal', bound: null },
    };

    constructor(private readonly intervalMs: number = 1000) { } 

    public evaluate(raw: RawSimOptions): AlarmResult {
        const now = Date.now();
        let level: AlarmLevel = 'normal';
        const messages: string[] = [];
        let shouldPlay = false;

        const activeWarningKeys: VitalKey[] = [];
        let primaryWarningKey: VitalKey | undefined;

        for (const key of Object.keys(vitalParameterMap) as VitalKey[]) {
            const param = vitalParameterMap[key];
            const value = raw[key];
            if (value == null || typeof value !== 'number' || value < 0) continue;
            const { level: newLevel, bound } = param.getStatus(value);

            if (newLevel === 'critical') level = 'critical';
            else if (newLevel === 'warning' && level === 'normal') level = 'warning';

            const last = this.lastStatuses[key];
            const isNewAlarm = newLevel !== 'normal' && (newLevel !== last.level || bound !== last.bound);

            if (isNewAlarm && !this.isMuted(newLevel)) {
                shouldPlay = true;
                if (!primaryWarningKey) primaryWarningKey = key;
            }

            if (newLevel === 'critical' && bound) {
                messages.push(`${this.capitalize(newLevel)} ${bound.toUpperCase()} ${param.label}`);
            }
            if (newLevel === 'warning' && bound) {
                messages.push(`${bound.toUpperCase()} ${param.label}`);
                activeWarningKeys.push(key);
            }

            this.lastStatuses[key] = { level: newLevel, bound };
        }

        if (shouldPlay) {
            this.lastTriggerAt = now;
            if (level === 'critical') {
                this.muteUntil.critical = now + 3000;
            } else if (level === 'warning') {
                this.muteUntil.warning = Infinity;
            }
        }

        this.lastLevel = level;
        return {
            level,
            messages,
            shouldPlay,
            primaryWarningKey,
            activeWarningKeys: activeWarningKeys.length > 0 ? activeWarningKeys : undefined
        };
    }

    private isMuted(level: AlarmLevel): boolean {
        const until = this.muteUntil[level];
        return until !== null && Date.now() < until;
    }

    private capitalize(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    public clearMute(level: AlarmLevel) {
        this.muteUntil[level] = null;
    }

    public mute(level: AlarmLevel, durationMs: number) {
        console.log(`[AC]mute(${level}, ${durationMs}) called.`);
        const now = Date.now();
        this.muteUntil[level] =
            level === 'warning' ? Infinity : now + durationMs;
    }
}
