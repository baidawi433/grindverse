import { SkillTreeConfig, BranchConfig } from "../config/SkillConfig.js";

export class SkillTreePanel {
  constructor(skillManager, onChange) {
    this.skillManager = skillManager;
    this.onChange = onChange;
    this.listContainer = document.querySelector("#skill-list");
    this.pointsLabel = document.querySelector("#skill-points-label");
    this.resetButton = document.querySelector("#reset-skill-btn");

    this.resetButton.addEventListener("click", () => {
      const refunded = this.skillManager.resetAll();
      console.log(`Skill di-reset. ${refunded} skill point dikembalikan.`);
      this.onChange();
    });
  }

  render() {
    this.pointsLabel.textContent = `Skill Points: ${this.skillManager.player.stats.skillPoints}`;
    this.listContainer.innerHTML = "";

    for (const branchKey of Object.keys(BranchConfig)) {
      const branch = BranchConfig[branchKey];
      const branchSkills = SkillTreeConfig.skills.filter((s) => s.branch === branchKey);

      const title = document.createElement("div");
      title.className = "branch-title";
      title.style.color = branch.color;
      title.textContent = branch.label;
      this.listContainer.appendChild(title);

      for (const skill of branchSkills) {
        this.listContainer.appendChild(this.renderSkillItem(skill));
      }
    }
  }

  getPrerequisiteText(skill) {
    if (skill.prerequisites.length === 0) return "";

    return skill.prerequisites
      .map((req) => {
        const reqSkill = this.skillManager.getSkill(req.id);
        return `${reqSkill.name} Lv.${req.level}`;
      })
      .join(", ");
  }

  renderSkillItem(skill) {
    const level = this.skillManager.getLevel(skill.id);
    const unlocked = this.skillManager.isUnlocked(skill.id);
    const canLearn = this.skillManager.canLearn(skill.id);
    const isMaxed = level >= skill.maxLevel;

    const el = document.createElement("div");
    el.className = "skill-item" + (unlocked ? "" : " locked");

    let buttonLabel = `Learn (${skill.cost} SP)`;
    if (isMaxed) buttonLabel = "MAX";
    else if (!unlocked) buttonLabel = "🔒 Locked";

    const requirementText = !unlocked
      ? `<div class="skill-desc" style="color:#f87171;">Butuh: ${this.getPrerequisiteText(skill)}</div>`
      : "";

    el.innerHTML = `
      <div class="skill-name">${skill.name}</div>
      <div class="skill-desc">${skill.description}</div>
      ${requirementText}
      <div class="skill-level">Level: ${level}/${skill.maxLevel}</div>
      <div class="item-actions">
        <button ${canLearn ? "" : "disabled"}>${buttonLabel}</button>
      </div>
    `;

    const button = el.querySelector("button");
    button.addEventListener("click", () => {
      this.skillManager.learn(skill.id);
      this.onChange();
    });

    return el;
  }
}