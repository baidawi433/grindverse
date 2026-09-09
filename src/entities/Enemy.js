import { EnemyTypes } from "../config/EnemyConfig.js";
import { CombatConfig } from "../config/CombatConfig.js";

export class Enemy {
  constructor(type, x, y) {
    const data = EnemyTypes[type];

    if (!data) {
      throw new Error(`Enemy type "${type}" tidak ditemukan di EnemyConfig`);
    }

    this.type = type;
    this.name = data.name;
    this.level = data.level;

    this.x = x;
    this.y = y;
    this.width = data.size.width;
    this.height = data.size.height;
    this.color = data.color;

    this.homeX = x;
    this.homeY = y;

    this.stats = {
      hp: data.hp,
      maxHp: data.hp,
      damage: data.damage,
      defense: data.defense,
      speed: data.speed,
      attackSpeed: data.attackSpeed,
      xpReward: data.xpReward,
      goldReward: data.goldReward,
      aggroRadius: data.aggroRadius,
    };

    this.state = "wander";
    this.isAlive = true;

    this.wanderTarget = null;
    this.wanderTimer = 0;
    this.wanderRadius = 100;

    this.stopDistance = 28;
    this.attackCooldown = 0;
  }

  getCenter() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  distanceTo(otherEntity) {
    const a = this.getCenter();
    const b = otherEntity.getCenter();
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
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

  pickNewWanderTarget() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * this.wanderRadius;

    this.wanderTarget = {
      x: this.homeX + Math.cos(angle) * dist,
      y: this.homeY + Math.sin(angle) * dist,
    };

    this.wanderTimer = 2 + Math.random() * 3;
  }

  tryMove(moveX, moveY, map, player) {
    const nextX = this.x + moveX;
    const boxX = { x: nextX, y: this.y, width: this.width, height: this.height };
    const blockedByMapX = map && map.checkCollision(boxX);
    const blockedByPlayerX = player && this.overlaps(boxX, player);
    if (!blockedByMapX && !blockedByPlayerX) {
      this.x = nextX;
    }

    const nextY = this.y + moveY;
    const boxY = { x: this.x, y: nextY, width: this.width, height: this.height };
    const blockedByMapY = map && map.checkCollision(boxY);
    const blockedByPlayerY = player && this.overlaps(boxY, player);
    if (!blockedByMapY && !blockedByPlayerY) {
      this.y = nextY;
    }
  }

  overlaps(box, other) {
    return (
      box.x < other.x + other.width &&
      box.x + box.width > other.x &&
      box.y < other.y + other.height &&
      box.y + box.height > other.y
    );
  }

  updateWander(deltaTime, map) {
    this.wanderTimer -= deltaTime;

    if (!this.wanderTarget || this.wanderTimer <= 0) {
      this.pickNewWanderTarget();
    }

    const dx = this.wanderTarget.x - this.x;
    const dy = this.wanderTarget.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 4) {
      const moveX = (dx / dist) * this.stats.speed * 0.4 * deltaTime;
      const moveY = (dy / dist) * this.stats.speed * 0.4 * deltaTime;
      this.tryMove(moveX, moveY, map, null);
    }
  }

  updateChase(deltaTime, map, player) {
    const dist = this.distanceTo(player);
    if (dist > this.stopDistance) {
      const a = this.getCenter();
      const b = player.getCenter();
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.sqrt(dx * dx + dy * dy) || 1;

      const moveX = (dx / length) * this.stats.speed * deltaTime;
      const moveY = (dy / length) * this.stats.speed * deltaTime;

      this.tryMove(moveX, moveY, map, player);
    }

    this.tryAttack(player, deltaTime);
  }

  tryAttack(player, deltaTime) {
    if (this.attackCooldown > 0) return;

    const dist = this.distanceTo(player);
    if (dist <= CombatConfig.enemyAttackRange) {
      player.takeDamage(this.stats.damage);
      this.attackCooldown = 1 / this.stats.attackSpeed;
    }
  }

  clampToWorld(worldBounds) {
    this.x = Math.max(0, Math.min(this.x, worldBounds.width - this.width));
    this.y = Math.max(0, Math.min(this.y, worldBounds.height - this.height));
  }

  updateState(player) {
    const dist = this.distanceTo(player);

    if (dist <= this.stats.aggroRadius) {
      this.state = "chase";
    } else if (dist > this.stats.aggroRadius * 1.5) {
      this.state = "wander";
    }
  }

  update(deltaTime, context) {
    if (!this.isAlive) return;

    const { map, player, worldBounds } = context;

    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }

    this.updateState(player);

    if (this.state === "chase") {
      this.updateChase(deltaTime, map, player);
    } else {
      this.updateWander(deltaTime, map);
    }

    if (worldBounds) {
      this.clampToWorld(worldBounds);
    }
  }
}