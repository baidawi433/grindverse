import { BossConfig } from "../config/BossConfig.js";
import { CombatConfig } from "../config/CombatConfig.js";

export class Boss {
  constructor(bossId, x, y) {
    const data = BossConfig[bossId];
    if (!data) {
      throw new Error(`Boss "${bossId}" tidak ditemukan di BossConfig`);
    }

    this.bossId = bossId;
    this.name = data.name;
    this.level = data.level;

    this.x = x;
    this.y = y;
    this.width = data.size.width;
    this.height = data.size.height;
    this.color = data.color;

    this.stats = {
      hp: data.hp,
      maxHp: data.hp,
      damage: data.damage,
      defense: data.defense,
      speed: data.speed,
      attackSpeed: data.attackSpeed,
      xpReward: data.xpReward,
      goldReward: data.goldReward,
    };

    this.phases = data.phases;
    this.currentPhaseIndex = 0;
    this.specialAttackConfig = data.specialAttack;
    this.uniqueLoot = data.uniqueLoot;

    this.isAlive = true;
    this.isBoss = true;

    this.attackCooldown = 0;
    this.specialAttackCooldown = this.specialAttackConfig.cooldown;
    this.telegraphTimer = 0;
    this.isTelegraphing = false;

    this.stopDistance = 40;
  }

  getCenter() {
    return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
  }

  distanceTo(other) {
    const a = this.getCenter();
    const b = other.getCenter();
    return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
  }

  getCurrentPhase() {
    const hpRatio = this.stats.hp / this.stats.maxHp;
    let active = this.phases[0];
    for (const phase of this.phases) {
      if (hpRatio <= phase.hpThreshold) {
        active = phase;
      }
    }
    return active;
  }

  takeDamage(rawDamage) {
    if (!this.isAlive) return 0;

    const reduced = Math.max(CombatConfig.minDamage, rawDamage - this.stats.defense);
    this.stats.hp -= reduced;

    const newPhase = this.getCurrentPhase();
    const newIndex = this.phases.indexOf(newPhase);
    if (newIndex !== this.currentPhaseIndex) {
      this.currentPhaseIndex = newIndex;
      this.phaseChanged = newPhase; // dibaca sekali oleh main.js untuk notice, lalu dibersihkan
      console.log(`${this.name} memasuki fase: ${newPhase.name}!`);
    }

    if (this.stats.hp <= 0) {
      this.stats.hp = 0;
      this.isAlive = false;
    }

    return reduced;
  }

  overlaps(box, other) {
    return (
      box.x < other.x + other.width &&
      box.x + box.width > other.x &&
      box.y < other.y + other.height &&
      box.y + box.height > other.y
    );
  }

  tryMove(moveX, moveY, map, player) {
    const nextX = this.x + moveX;
    const boxX = { x: nextX, y: this.y, width: this.width, height: this.height };
    if (!(map && map.checkCollision(boxX)) && !(player && this.overlaps(boxX, player))) {
      this.x = nextX;
    }

    const nextY = this.y + moveY;
    const boxY = { x: this.x, y: nextY, width: this.width, height: this.height };
    if (!(map && map.checkCollision(boxY)) && !(player && this.overlaps(boxY, player))) {
      this.y = nextY;
    }
  }

  clampToWorld(worldBounds) {
    this.x = Math.max(0, Math.min(this.x, worldBounds.width - this.width));
    this.y = Math.max(0, Math.min(this.y, worldBounds.height - this.height));
  }

  updateMovement(deltaTime, map, player) {
    if (this.isTelegraphing) return; // boss berhenti bergerak saat bersiap serangan spesial

    const phase = this.getCurrentPhase();
    const dist = this.distanceTo(player);

    if (dist > this.stopDistance) {
      const a = this.getCenter();
      const b = player.getCenter();
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.sqrt(dx * dx + dy * dy) || 1;

      const speed = this.stats.speed * phase.speedMultiplier;
      const moveX = (dx / length) * speed * deltaTime;
      const moveY = (dy / length) * speed * deltaTime;

      this.tryMove(moveX, moveY, map, player);
    }
  }

  updateBasicAttack(deltaTime, player) {
    if (this.isTelegraphing) return;
    if (this.attackCooldown > 0) return;

    const dist = this.distanceTo(player);
    if (dist <= CombatConfig.enemyAttackRange) {
      const phase = this.getCurrentPhase();
      const damage = Math.round(this.stats.damage * phase.damageMultiplier);
      player.takeDamage(damage);
      this.attackCooldown = 1 / this.stats.attackSpeed;
    }
  }

  updateSpecialAttack(deltaTime, player, onSpecialHit) {
    if (this.isTelegraphing) {
      this.telegraphTimer -= deltaTime;
      if (this.telegraphTimer <= 0) {
        this.isTelegraphing = false;

        const dist = this.distanceTo(player);
        if (dist <= this.specialAttackConfig.range) {
          const phase = this.getCurrentPhase();
          const damage = Math.round(
            this.stats.damage * this.specialAttackConfig.damageMultiplier * phase.damageMultiplier
          );
          player.takeDamage(damage);
          if (onSpecialHit) onSpecialHit(damage);
        }
      }
      return;
    }

    if (this.specialAttackCooldown > 0) {
      this.specialAttackCooldown -= deltaTime;
      return;
    }

    const dist = this.distanceTo(player);
    if (dist <= this.specialAttackConfig.range * 1.5) {
      this.isTelegraphing = true;
      this.telegraphTimer = this.specialAttackConfig.telegraphDuration;
      this.specialAttackCooldown = this.specialAttackConfig.cooldown;
      console.log(`${this.name} bersiap melancarkan serangan spesial!`);
    }
  }

  update(deltaTime, context) {
    if (!this.isAlive) return;

    const { map, player, worldBounds, onSpecialHit } = context;

    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }

    this.updateMovement(deltaTime, map, player);
    this.updateBasicAttack(deltaTime, player);
    this.updateSpecialAttack(deltaTime, player, onSpecialHit);

    if (worldBounds) {
      this.clampToWorld(worldBounds);
    }
  }
}