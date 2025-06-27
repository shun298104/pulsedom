// /src/lib/AudioController.ts

import { playBeep } from '../audio/playBeep';

type IsBeepOnFn = (() => boolean) | undefined;

export class AudioController {
  private audioCtx: AudioContext | null;
  private isBeepOn: IsBeepOnFn;

  constructor({
    audioCtx,
    isBeepOn,
  }: {
    audioCtx?: AudioContext | null;
    isBeepOn?: () => boolean;
  }) {
    this.audioCtx = audioCtx ?? null;
    this.isBeepOn = isBeepOn;
  }

  /** AudioContextの差し替え */
  public setAudioContext(ctx: AudioContext) {
    this.audioCtx = ctx;
  }

  /** 音声鳴動 */
  public playBeep(spo2: number) {
    if (this.audioCtx && this.isBeepOn?.()) {
      playBeep(this.audioCtx, spo2);
    }
  }

  /** Beep ON/OFF判定関数の差し替え（必要なら） */
  public setIsBeepOn(isBeepOn: () => boolean) {
    this.isBeepOn = isBeepOn;
  }
}

