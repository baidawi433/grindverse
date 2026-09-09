export class InputManager {
  constructor(canvas) {
    this.keys = {};
    this.attackPressed = false;

    window.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;

      if (e.key === " ") {
        this.attackPressed = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    if (canvas) {
      canvas.addEventListener("click", () => {
        this.attackPressed = true;
      });
    }
  }

  isDown(key) {
    return !!this.keys[key.toLowerCase()];
  }

  consumeAttackPress() {
    if (this.attackPressed) {
      this.attackPressed = false;
      return true;
    }
    return false;
  }

  getMovementDirection() {
    let dx = 0;
    let dy = 0;

    if (this.isDown("w") || this.isDown("arrowup")) dy -= 1;
    if (this.isDown("s") || this.isDown("arrowdown")) dy += 1;
    if (this.isDown("a") || this.isDown("arrowleft")) dx -= 1;
    if (this.isDown("d") || this.isDown("arrowright")) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;
    }

    return { dx, dy };
  }
}