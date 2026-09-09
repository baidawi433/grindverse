import { CombatConfig } from "../config/CombatConfig.js";

const MAX_DAMAGE_NUMBERS = 40;

export class DamageNumbers {
  constructor() {
    this.numbers = [];
  }

  spawn(x, y, amount, color = "#f87171") {
    if (this.numbers.length >= MAX_DAMAGE_NUMBERS) {
      this.numbers.shift();
    }

    this.numbers.push({
      x,
      y,
      amount,
      color,
      life: CombatConfig.damageNumberLifetime,
      maxLife: CombatConfig.damageNumberLifetime,
    });
  }

  update(deltaTime) {
    for (const num of this.numbers) {
      num.y -= CombatConfig.damageNumberRiseSpeed * deltaTime;
      num.life -= deltaTime;
    }

    this.numbers = this.numbers.filter((n) => n.life > 0);
  }
}