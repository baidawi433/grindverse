import { AreaConfig } from "../config/AreaConfig.js";

export class AreaManager {
  constructor(player) {
    this.player = player;
    this.currentAreaId = "village";
  }

  getCurrentArea() {
    return AreaConfig[this.currentAreaId];
  }

  getArea(areaId) {
    return AreaConfig[areaId] || null;
  }

  isUnlocked(areaId) {
    const area = AreaConfig[areaId];
    if (!area) return false;
    return this.player.stats.level >= area.requiredLevel;
  }

  switchTo(areaId) {
    const area = AreaConfig[areaId];
    if (!area) return false;
    if (!this.isUnlocked(areaId)) return false;

    this.currentAreaId = areaId;
    return true;
  }
}