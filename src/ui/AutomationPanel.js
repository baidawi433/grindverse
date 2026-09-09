import { AutomationConfig } from "../config/AutomationConfig.js";

export class AutomationPanel {
  constructor(player) {
    this.player = player;
    this.container = document.querySelector("#automation-list");
  }

  render() {
    this.container.innerHTML = "";

    for (const toggle of AutomationConfig.toggles) {
      const row = document.createElement("div");
      row.className = "toggle-row";

      const isChecked = toggle.id === "autoAttack" ? this.player.autoAttackEnabled : toggle.defaultValue;

      row.innerHTML = `
        <div>
          <div class="toggle-label">${toggle.label}</div>
          <div class="toggle-desc">${toggle.description}</div>
        </div>
        <input type="checkbox" class="toggle-switch" ${isChecked ? "checked" : ""} />
      `;

      const checkbox = row.querySelector("input");
      checkbox.addEventListener("change", () => {
        if (toggle.id === "autoAttack") {
          this.player.autoAttackEnabled = checkbox.checked;
          console.log(`Auto Attack: ${checkbox.checked ? "ON" : "OFF"}`);
        }
      });

      this.container.appendChild(row);
    }
  }
}