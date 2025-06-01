// src/lib/AlarmAudioController.ts

let lastNormalAt: number | null = null;
let criticalMutedUntil: number | null = null;
const mutedWarningKeys = new Set<string>();

export const updateAlarmSound = (
  level: 'normal' | 'warning' | 'critical',
  audio: HTMLAudioElement | null,
  srcBase: string,
  isAlarmOn: boolean = true,    // ←追加
  warningKey?: string,
  activeWarningKeys?: string[],
) => {
  if (!audio) return;
  if (!isAlarmOn) return;

  const now = Date.now();

  // --- normal level の時のサイレント処理（全警告解除時） ---
  const allNormal = level === 'normal' || (Array.isArray(activeWarningKeys) && activeWarningKeys.length === 0);
  if (allNormal) {
    if (!lastNormalAt) lastNormalAt = now;
    if (now - lastNormalAt > 3000) {
      if (!audio.paused) {
        audio.pause();
        console.log('🔕 Stopped alarm after normal sustained');
      }
    }
    mutedWarningKeys.clear();
    return;
  }

  // --- warning 再鳴動判定 ---
  if (level === 'warning') {
    if (Array.isArray(activeWarningKeys)) {
      const activeSet = new Set(activeWarningKeys);
      for (const key of mutedWarningKeys) {
        if (!activeSet.has(key)) {
          mutedWarningKeys.delete(key);
          console.log(`🔄 Unmuted ${key} (no longer active)`);
        }
      }
    }

    if (warningKey) {
      if (mutedWarningKeys.has(warningKey)) return;
      mutedWarningKeys.add(warningKey);
    } else {
      // fallback: 全警告が未ミュートなら鳴らす
      if (mutedWarningKeys.size === 0) {
        console.log('⚠️ Warning with no key — triggering fallback alarm');
      } else {
        return;
      }
    }
  }

  // --- critical再鳴動のミュート中なら return ---
  if (level === 'critical' && criticalMutedUntil && now < criticalMutedUntil) {
    return;
  }

  // 状態リセット
  lastNormalAt = null;

  const src = `${srcBase}/sounds/alarm_${level}.mp3`;
  const shouldForcePlay =
    audio.src !== src || audio.paused || audio.ended || audio.currentTime === 0;

  if (!shouldForcePlay) return;

  if (audio.src !== src) {
    audio.pause();
    audio.src = src;
  }

  audio.currentTime = 0;
  audio.volume = 1.0;
  audio.muted = false;
  audio.play().catch((e) => {
    console.warn('Alarm play failed:', e);
  });
};

export const stopAlarm = (audio: HTMLAudioElement | null, level?: 'normal' | 'warning' | 'critical') => {
  if (!audio) return;
  if (!audio.paused) {
    audio.pause();
    console.log('🔕 Alarm manually stopped');
  }
  if (level === 'critical') {
    criticalMutedUntil = Date.now() + 3000;
    console.log('⏱️ Critical alarm will resume in 3 sec');
  }
};
