import { AscensionConfig } from "../config/AscensionConfig.js";
import { formatNumber } from "../core/NumberFormat.js";

export class AscensionTreePanel {
  constructor(ascensionManager, onChange) {
    this.ascensionManager = ascensionManager;
    this.onChange = onChange;
    this.container = document.querySelector("#ascension-tree-list");
  }

  render() {
    this.container.innerHTML = "";

    for (const upgrade of AscensionConfig.permanentUpgrades) {
      const level = this.ascensionManager.getLevel(upgrade.id);
      const cost = this.ascensionManager.getCost(upgrade.id);
      const canBuy = this.ascensionManager.canBuy(upgrade.id);
      const isMaxed = level >= upgrade.maxLevel;

      const el = document.createElement("div");
      el.className = "upgrade-item";
      el.innerHTML = `
        <div class="name" style="color:#a78bfa;">${upgrade.name}</div>
        <div class="desc">${upgrade.description}</div>
        <div class="level">Level: ${level}/${upgrade.maxLevel}</div>
        <div class="item-actions">
          <button ${canBuy ? "" : "disabled"}>${isMaxed ? "MAX" : `Beli (✨ ${formatNumber(cost)})`}</button>
        </div>
      `;

      const button = el.querySelector("button");
      button.addEventListener("click", () => {
        this.ascensionManager.buy(upgrade.id);
        this.onChange();
      });

      this.container.appendChild(el);
    }
  }
}