import { EquipmentSlots } from "../config/EquipmentConfig.js";

export class Equipment {
  constructor(player) {
    this.player = player;
    this.slots = {};

    for (const slot of EquipmentSlots) {
      this.slots[slot] = null;
    }
  }

  applyBonuses(item, sign = 1) {
    for (const [stat, value] of Object.entries(item.bonuses)) {
      this.player.stats[stat] += value * sign;
    }
  }

  equip(item, inventory) {
    const existing = this.slots[item.slot];
    if (existing) {
      this.unequip(item.slot, inventory);
    }

    const removed = inventory.removeItem(item.id);
    if (!removed) return false;

    this.slots[item.slot] = item;
    this.applyBonuses(item, 1);
    return true;
  }

  unequip(slot, inventory) {
    const item = this.slots[slot];
    if (!item) return false;

    this.applyBonuses(item, -1);
    this.slots[slot] = null;
    inventory.addItem(item);
    return true;
  }
}