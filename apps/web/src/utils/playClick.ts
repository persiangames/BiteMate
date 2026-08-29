let audioCtx: AudioContext | null = null;

export function resumeAudioContext(): void {
  try {
    const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) {
      return;
    }
    audioCtx = audioCtx ?? new Ctx();
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
  } catch {
    // Ignore autoplay restrictions.
  }
}

export function playClick() {
  try {
    resumeAudioContext();
    if (!audioCtx) {
      return;
    }
    const now = audioCtx.currentTime;
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(920, now);
    oscillator.frequency.exponentialRampToValueAtTime(380, now + 0.045);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.08);
  } catch {
    // Ignore autoplay or unsupported audio.
  }
}
