export class AreaNotice {
  constructor() {
    this.message = "";
    this.color = "#facc15";
    this.life = 0;
    this.maxLife = 2.5;
  }

  show(message, color = "#facc15") {
    this.message = message;
    this.color = color;
    this.life = this.maxLife;
  }

  update(deltaTime) {
    if (this.life > 0) {
      this.life -= deltaTime;
      if (this.life <= 0) {
        this.life = 0;
        this.message = "";
      }
    }
  }
}