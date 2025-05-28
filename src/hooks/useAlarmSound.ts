// src/hooks/useAlarmSound.ts

import { useEffect, useMemo, useState } from 'react';
import { AlarmController, AlarmLevel } from '../lib/AlarmController';
import { updateAlarmSound } from '../lib/AlarmAudioController';
import { SimOptions } from '../types/SimOptions';

export function useAlarmSound(
  simOptions: SimOptions,
  hr: number,
  audioRef: React.RefObject<HTMLAudioElement | null>
): {
  alarmLevel: AlarmLevel;
  alarmMessages: string[];
} {
  const [alarmLevel, setAlarmLevel] = useState<AlarmLevel>('normal');
  const [alarmMessages, setAlarmMessages] = useState<string[]>([]);
  const alarmController = useMemo(() => new AlarmController(), []);

  useEffect(() => {
    const raw = { ...simOptions.getRaw(), hr };
    const result = alarmController.evaluate(raw);
    setAlarmLevel(result.level);
    setAlarmMessages(result.messages);

    updateAlarmSound(
      result.level,
      audioRef.current,
      import.meta.env.BASE_URL,
      result.primaryWarningKey,
      result.activeWarningKeys
    );
  }, [simOptions, hr]);

  return { alarmLevel, alarmMessages };
}
