// src/hooks/useAlarmSound.ts

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { AlarmController, AlarmLevel } from '../lib/AlarmController';
import { updateAlarmSound, stopAlarm as stopAlarmLib } from '../lib/AlarmAudioController';
import { SimOptions } from '../types/SimOptions';

export function useAlarmSound(
  simOptions: SimOptions,
  hr: number
): {
  alarmLevel: AlarmLevel;
  alarmMessages: string[];
  isAlarmOn: boolean;
  toggleAlarm: () => void;
  stopAlarm: () => void;
} {
  const [alarmLevel, setAlarmLevel] = useState<AlarmLevel>('normal');
  const [alarmMessages, setAlarmMessages] = useState<string[]>([]);
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  const alarmController = useMemo(() => new AlarmController(), []);

  useEffect(() => {
    const raw = { ...simOptions.getRaw(), hr };
    const result = alarmController.evaluate(raw);
    setAlarmLevel(result.level);
    setAlarmMessages(result.messages);

    updateAlarmSound(
      result.level,
      alarmAudioRef.current,
      import.meta.env.BASE_URL,
      isAlarmOn,
      result.primaryWarningKey,
      result.activeWarningKeys
    );
  }, [simOptions, hr, isAlarmOn]);

  const stopAlarm = useCallback(() => {
    stopAlarmLib(alarmAudioRef.current, alarmLevel);
    setIsAlarmOn(false);
  }, [alarmLevel]);

  const toggleAlarm = useCallback(() => {
    setIsAlarmOn((prev) => {
      if (prev) stopAlarmLib(alarmAudioRef.current, alarmLevel);
      return !prev;
    });
  }, [alarmLevel]);

  return {
    alarmLevel,
    alarmMessages,
    isAlarmOn,
    toggleAlarm,
    stopAlarm,
  };
}
