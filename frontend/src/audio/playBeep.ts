export function calcFrequency(spo2: number | undefined): number {
  if (spo2 === undefined) return 1000;
  const clamped = Math.max(50, Math.min(spo2, 100)); // 50〜100に制限
  return 500 + (clamped - 70) * 10; // 70→500Hz、100→800Hz
}

export function playBeep(audioCtx: AudioContext, spo2?: number) {
  const freq = calcFrequency(spo2);
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  console.log("🔊 playBeep:", { freq, spo2 });
  
  if (!isFinite(freq)) return;

  osc.type = 'square';
  osc.frequency.value = freq;
  gain.gain.value = 0.05;

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}