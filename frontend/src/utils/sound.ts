//src/utils/sound.ts

export const playBeep = (): void => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
  
    oscillator.type = 'square'; // 音のタイプ（squareが"ピッ"っぽい）
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime); // 1kHz
  
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime); // 音量小さめ
    oscillator.connect(gainNode).connect(ctx.destination);
  
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.05); // 50msだけ再生
  };