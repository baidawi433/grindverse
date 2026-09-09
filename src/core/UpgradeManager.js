import { UpgradeConfig } from "../config/UpgradeConfig.js";

export class UpgradeManager {
  constructor(player) {
    this.player = player;
    this.levels = {};

    for (const upgrade of UpgradeConfig.upgrades) {
      this.levels[upgrade.id] = 0;
    }
  }

  getLevel(id) {
    return this.levels[id] || 0;
  }

  getCost(id) {
    const upgrade = UpgradeConfig.upgrades.find((u) => u.id === id);
    const level = this.getLevel(id);
    return Math.round(upgrade.baseCost * Math.pow(upgrade.costGrowth, level));
  }

  canAfford(id) {
    return this.player.stats.gold >= this.getCost(id);
  }

  buy(id) {
    const upgrade = UpgradeConfig.upgrades.find((u) => u.id === id);
    if (!upgrade) return false;

    const cost = this.getCost(id);
    if (this.player.stats.gold < cost) return false;

    this.player.stats.gold -= cost;
    this.levels[id] += 1;

    this.applyEffect(upgrade);

    return true;
  }

  applyEffect(upgrade) {
    const { statKey, valuePerLevel } = upgrade;

    if (statKey === "maxHp") {
      this.player.stats.maxHp += valuePerLevel;
      this.player.stats.hp += valuePerLevel; // langsung heal sejumlah kenaikan
    } else {
      this.player.stats[statKey] += valuePerLevel;
    }
  }
}