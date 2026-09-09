export class SoundManager {
  constructor() {
    this.enabled = true;
    this.audioContext = null;
    this.masterVolume = 0.15;
  }

  ensureContext() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        this.enabled = false;
        return null;
      }
      this.audioContext = new AudioContextClass();
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    return this.audioContext;
  }

  playTone({ frequency = 440, duration = 0.1, type = "sine", volumeMultiplier = 1, slideTo = null }) {
    if (!this.enabled) return;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    if (slideTo !== null) {
      oscillator.frequency.linearRampToValueAtTime(slideTo, ctx.currentTime + duration);
    }

    const finalVolume = this.masterVolume * volumeMultiplier;
    gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  playAttack() {
    this.playTone({ frequency: 220, duration: 0.06, type: "square", volumeMultiplier: 0.6 });
  }

  playHit() {
    this.playTone({ frequency: 150, duration: 0.08, type: "sawtooth", volumeMultiplier: 0.5 });
  }

  playCritical() {
    this.playTone({ frequency: 500, duration: 0.12, type: "square", volumeMultiplier: 0.8, slideTo: 800 });
  }

  playLevelUp() {
    this.playTone({ frequency: 400, duration: 0.15, type: "triangle", volumeMultiplier: 0.9, slideTo: 800 });
    setTimeout(() => this.playTone({ frequency: 600, duration: 0.2, type: "triangle", volumeMultiplier: 0.9, slideTo: 1000 }), 120);
  }

  playLoot() {
    this.playTone({ frequency: 700, duration: 0.08, type: "sine", volumeMultiplier: 0.6, slideTo: 900 });
  }

  playEnemyDeath() {
    this.playTone({ frequency: 200, duration: 0.15, type: "sawtooth", volumeMultiplier: 0.5, slideTo: 60 });
  }

  playBossDefeat() {
    this.playTone({ frequency: 300, duration: 0.3, type: "triangle", volumeMultiplier: 1, slideTo: 900 });
    setTimeout(() => this.playTone({ frequency: 500, duration: 0.4, type: "triangle", volumeMultiplier: 1, slideTo: 1200 }), 200);
  }

  playAscend() {
    this.playTone({ frequency: 300, duration: 0.5, type: "sine", volumeMultiplier: 1, slideTo: 1400 });
  }

  playPortal() {
    this.playTone({ frequency: 350, duration: 0.15, type: "sine", volumeMultiplier: 0.5, slideTo: 500 });
  }

  playError() {
    this.playTone({ frequency: 150, duration: 0.15, type: "square", volumeMultiplier: 0.5, slideTo: 100 });
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}