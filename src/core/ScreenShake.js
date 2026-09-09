export class ScreenShake {
  constructor() {
    this.intensity = 0;
    this.duration = 0;
  }

  trigger(intensity, duration) {
    this.intensity = Math.max(this.intensity, intensity);
    this.duration = Math.max(this.duration, duration);
  }

  update(deltaTime) {
    if (this.duration > 0) {
      this.duration -= deltaTime;
      if (this.duration <= 0) {
        this.duration = 0;
        this.intensity = 0;
      }
    }
  }

  getOffset() {
    if (this.duration <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.intensity,
      y: (Math.random() - 0.5) * this.intensity,
    };
  }
}