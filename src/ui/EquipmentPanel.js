import { EquipmentSlots } from "../config/EquipmentConfig.js";

export class EquipmentPanel {
  constructor(equipment, inventory, onChange) {
    this.equipment = equipment;
    this.inventory = inventory;
    this.onChange = onChange;
    this.container = document.querySelector("#equipment-list");
  }

  render() {
    this.container.innerHTML = "";

    for (const slot of EquipmentSlots) {
      const item = this.equipment.slots[slot];
      const el = document.createElement("div");
      el.className = "equipment-slot";

      if (item) {
        const bonusText = Object.entries(item.bonuses)
          .map(([stat, val]) => `+${val} ${stat}`)
          .join(", ");

        el.title = `${item.name}\n${bonusText}`;
        el.innerHTML = `
          <div class="slot-label">${slot}</div>
          <div class="item-name" style="color:${item.color}">${item.name}</div>
          <div class="item-desc">${bonusText}</div>
          <div class="item-actions">
            <button class="unequip-btn">Unequip</button>
          </div>
        `;

        el.querySelector(".unequip-btn").addEventListener("click", () => {
          this.equipment.unequip(slot, this.inventory);
          this.onChange();
        });
      } else {
        el.innerHTML = `
          <div class="slot-label">${slot}</div>
          <div class="item-empty">(kosong)</div>
        `;
      }

      this.container.appendChild(el);
    }
  }
}