import { PlayerConfig } from "../config/PlayerConfig.js";
import { CombatConfig } from "../config/CombatConfig.js";

export class Player {
  constructor() {
    this.x = PlayerConfig.startPosition.x;
    this.y = PlayerConfig.startPosition.y;
    this.width = PlayerConfig.size.width;
    this.height = PlayerConfig.size.height;
    this.color = PlayerConfig.color;

    this.stats = { ...PlayerConfig.baseStats };
    this.baseCriticalChance = PlayerConfig.baseStats.criticalChance;

    this.facing = "down";
    this.isAlive = true;

    this.autoAttackCooldown = 0;
    this.autoAttackEnabled = true;
    this.attackAnimTimer = 0;

    // Bonus permanen dari Ascension Tree — TIDAK ikut ter-reset saat resetForAscension()
    this.ascensionBonuses = {
      damageMultiplier: 1,
      goldMultiplier: 1,
      xpMultiplier: 1,
      criticalChanceBonus: 0,
      offlineMultiplier: 1,
    };
  }

  update(deltaTime, direction = { dx: 0, dy: 0 }, map = null, worldBounds = null) {
    if (!this.isAlive) return;

    const { dx, dy } = direction;

    if (dx !== 0 || dy !== 0) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.facing = dx > 0 ? "right" : "left";
      } else {
        this.facing = dy > 0 ? "down" : "up";
      }

      const nextX = this.x + dx * this.stats.moveSpeed * deltaTime;
      const boxX = { x: nextX, y: this.y, width: this.width, height: this.height };
      if (!map || !map.checkCollision(boxX)) {
        this.x = nextX;
      }

      const nextY = this.y + dy * this.stats.moveSpeed * deltaTime;
      const boxY = { x: this.x, y: nextY, width: this.width, height: this.height };
      if (!map || !map.checkCollision(boxY)) {
        this.y = nextY;
      }
    }

    if (this.autoAttackCooldown > 0) {
      this.autoAttackCooldown -= deltaTime;
    }

    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer -= deltaTime;
    }

    if (worldBounds) {
      this.clampToWorld(worldBounds);
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  canAutoAttack() {
    return this.autoAttackEnabled && this.autoAttackCooldown <= 0;
  }

  triggerAttackAnim() {
    this.attackAnimTimer = 0.15;
  }

  resetAutoAttackCooldown() {
    this.autoAttackCooldown = 1 / this.stats.attackSpeed;
  }

  takeDamage(rawDamage) {
    if (!this.isAlive) return 0;

    const reduced = Math.max(CombatConfig.minDamage, rawDamage - this.stats.defense);
    this.stats.hp -= reduced;

    if (this.stats.hp <= 0) {
      this.stats.hp = 0;
      this.isAlive = false;
    }

    return reduced;
  }

  gainXp(amount) {
    const multiplier = this.stats.xpMultiplier * this.ascensionBonuses.xpMultiplier;
    const finalAmount = Math.round(amount * multiplier);
    this.stats.xp += finalAmount;

    while (this.stats.xp >= this.stats.xpToNextLevel) {
      this.stats.xp -= this.stats.xpToNextLevel;
      this.levelUp();
    }

    return finalAmount;
  }

  levelUp() {
    this.stats.level += 1;
    this.stats.xpToNextLevel = Math.round(this.stats.xpToNextLevel * 1.2);

    this.stats.maxHp += 20;
    this.stats.hp = this.stats.maxHp;
    this.stats.attack += 3;
    this.stats.defense += 1;
    this.stats.skillPoints += 1;

    console.log(`LEVEL UP! Sekarang Level ${this.stats.level}. +1 Skill Point!`);
  }

  gainGold(amount) {
    const multiplier = this.stats.goldMultiplier * this.ascensionBonuses.goldMultiplier;
    const finalAmount = Math.round(amount * multiplier);
    this.stats.gold += finalAmount;
    return finalAmount;
  }

  resetForAscension() {
    this.x = PlayerConfig.startPosition.x;
    this.y = PlayerConfig.startPosition.y;
    this.stats = { ...PlayerConfig.baseStats };
    this.stats.criticalChance = this.baseCriticalChance + this.ascensionBonuses.criticalChanceBonus;

    this.facing = "down";
    this.isAlive = true;
    this.autoAttackCooldown = 0;
    // ascensionBonuses SENGAJA tidak direset di sini — itu tujuan utama Ascension
  }

  clampToWorld(worldBounds) {
    this.x = Math.max(0, Math.min(this.x, worldBounds.width - this.width));
    this.y = Math.max(0, Math.min(this.y, worldBounds.height - this.height));
  }

  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }
}