import { SkillTreeConfig } from "../config/SkillConfig.js";

export class SkillManager {
  constructor(player) {
    this.player = player;
    this.levels = {};

    for (const skill of SkillTreeConfig.skills) {
      this.levels[skill.id] = 0;
    }
  }

  getLevel(id) {
    return this.levels[id] || 0;
  }

  getSkill(id) {
    return SkillTreeConfig.skills.find((s) => s.id === id);
  }

  isUnlocked(id) {
    const skill = this.getSkill(id);
    if (!skill) return false;

    for (const req of skill.prerequisites) {
      if (this.getLevel(req.id) < req.level) {
        return false;
      }
    }
    return true;
  }

  canLearn(id) {
    const skill = this.getSkill(id);
    if (!skill) return false;

    const level = this.getLevel(id);
    if (level >= skill.maxLevel) return false;
    if (!this.isUnlocked(id)) return false;
    if (this.player.stats.skillPoints < skill.cost) return false;

    return true;
  }

  learn(id) {
    if (!this.canLearn(id)) return false;

    const skill = this.getSkill(id);
    this.player.stats.skillPoints -= skill.cost;
    this.levels[id] += 1;
    this.applyEffect(skill);

    return true;
  }

  applyEffect(skill) {
    const { statKey, valuePerLevel } = skill.effect;

    if (statKey === "maxHp") {
      this.player.stats.maxHp += valuePerLevel;
      this.player.stats.hp += valuePerLevel;
    } else {
      this.player.stats[statKey] += valuePerLevel;
    }
  }

  removeEffect(skill) {
    const { statKey, valuePerLevel } = skill.effect;

    if (statKey === "maxHp") {
      this.player.stats.maxHp -= valuePerLevel;
    } else {
      this.player.stats[statKey] -= valuePerLevel;
    }
  }

  resetAll() {
    if (Object.values(this.levels).every((lvl) => lvl === 0)) {
      console.log("Tidak ada skill yang dipelajari, tidak ada yang di-reset.");
      return 0;
    }

    let refundedPoints = 0;
    const skillsReversed = [...SkillTreeConfig.skills].reverse();

    for (const skill of skillsReversed) {
      const level = this.getLevel(skill.id);
      for (let i = 0; i < level; i++) {
        this.removeEffect(skill);
        refundedPoints += skill.cost;
      }
      this.levels[skill.id] = 0;
    }

    this.player.stats.skillPoints += refundedPoints;

    // Pengaman: pastikan HP tidak pernah melebihi maxHp yang baru setelah reset
    this.player.stats.hp = Math.min(this.player.stats.hp, this.player.stats.maxHp);

    return refundedPoints;
  }
}