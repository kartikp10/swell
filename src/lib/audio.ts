// Simple web audio tone synthesizers for soothing sensory feedback
class AudioManager {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch {
          this.ctx = null;
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play a gentle warm chime when contraction starts
  playStartChime(): void {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime); // 432Hz calming tuning
      osc.frequency.exponentialRampToValueAtTime(576, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Play a soft resolving chime when contraction ends
  playEndChime(): void {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(576, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(432, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.7);
    } catch {
      // Audio context might be restricted
    }
  }

  // Trigger subtle device vibration if supported
  vibrate(pattern: number | number[] = 40): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // vibration unsupported or blocked
      }
    }
  }
}

export const audio = new AudioManager();
