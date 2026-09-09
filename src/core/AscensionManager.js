import { AscensionConfig } from "../config/AscensionConfig.js";

export class AscensionManager {
  constructor(player) {
    this.player = player;
    this.soul = 0;
    this.permanentLevels = {};

    for (const upgrade of AscensionConfig.permanentUpgrades) {
      this.permanentLevels[upgrade.id] = 0;
    }

    this.applyAllPermanentBonuses();
  }

  canAscend() {
    return this.player.stats.level >= AscensionConfig.minLevelToAscend;
  }

  calculateSoulReward() {
    return Math.max(1, Math.floor(this.player.stats.level / AscensionConfig.soulPerLevelDivisor));
  }

  getUpgrade(id) {
    return AscensionConfig.permanentUpgrades.find((u) => u.id === id);
  }

  getLevel(id) {
    return this.permanentLevels[id] || 0;
  }

  getCost(id) {
    const upgrade = this.getUpgrade(id);
    const level = this.getLevel(id);
    return Math.round(upgrade.baseCost * Math.pow(upgrade.costGrowth, level));
  }

  canBuy(id) {
    const upgrade = this.getUpgrade(id);
    const level = this.getLevel(id);
    if (level >= upgrade.maxLevel) return false;
    return this.soul >= this.getCost(id);
  }

  buy(id) {
    if (!this.canBuy(id)) return false;

    const cost = this.getCost(id);
    this.soul -= cost;
    this.permanentLevels[id] += 1;
    this.applyAllPermanentBonuses();

    return true;
  }

  applyAllPermanentBonuses() {
    const bonuses = {
      damageMultiplier: 1,
      goldMultiplier: 1,
      xpMultiplier: 1,
      criticalChanceBonus: 0,
      offlineMultiplier: 1,
    };

    for (const upgrade of AscensionConfig.permanentUpgrades) {
      const level = this.getLevel(upgrade.id);
      bonuses[upgrade.statKey] += level * upgrade.valuePerLevel;
    }

    this.player.ascensionBonuses = bonuses;
    this.player.stats.criticalChance = this.player.baseCriticalChance + bonuses.criticalChanceBonus;
  }

  performAscend() {
    if (!this.canAscend()) return 0;

    const soulGained = this.calculateSoulReward();
    this.soul += soulGained;

    this.player.resetForAscension();
    this.applyAllPermanentBonuses();

    return soulGained;
  }
}