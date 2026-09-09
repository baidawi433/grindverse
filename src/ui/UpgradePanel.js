import { UpgradeConfig } from "../config/UpgradeConfig.js";
import { formatNumber } from "../core/NumberFormat.js";

export class UpgradePanel {
  constructor(upgradeManager) {
    this.upgradeManager = upgradeManager;
    this.container = document.querySelector("#upgrade-list");
  }

  render() {
    this.container.innerHTML = "";

    for (const upgrade of UpgradeConfig.upgrades) {
      const level = this.upgradeManager.getLevel(upgrade.id);
      const cost = this.upgradeManager.getCost(upgrade.id);
      const canAfford = this.upgradeManager.canAfford(upgrade.id);

      const item = document.createElement("div");
      item.className = "upgrade-item";
      item.innerHTML = `
        <div class="name">${upgrade.name}</div>
        <div class="desc">${upgrade.description}</div>
        <div class="level">Level: ${level}</div>
        <button ${canAfford ? "" : "disabled"}>Beli (💰 ${formatNumber(cost)})</button>
      `;

      const button = item.querySelector("button");
      button.addEventListener("click", () => {
        this.upgradeManager.buy(upgrade.id);
        this.render();
      });

      this.container.appendChild(item);
    }
  }
}