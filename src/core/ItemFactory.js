import { EquipmentSlots, ItemTemplates, RarityConfig } from "../config/EquipmentConfig.js";

let itemIdCounter = 0;

function pickRarity() {
  const entries = Object.entries(RarityConfig);
  const totalWeight = entries.reduce((sum, [, r]) => sum + r.dropWeight, 0);
  let roll = Math.random() * totalWeight;

  for (const [key, r] of entries) {
    if (roll < r.dropWeight) return key;
    roll -= r.dropWeight;
  }

  return "common";
}

export function generateRandomItem(enemyLevel = 1) {
  const slot = EquipmentSlots[Math.floor(Math.random() * EquipmentSlots.length)];
  const template = ItemTemplates[slot];
  const rarityKey = pickRarity();
  const rarity = RarityConfig[rarityKey];

  const variance = 0.8 + Math.random() * 0.4;
  const isSmallStat = template.primaryStat === "criticalChance";
  const rawValue = template.baseValue * rarity.statMultiplier * variance * (1 + enemyLevel * 0.08);
  const statValue = isSmallStat ? +rawValue.toFixed(3) : Math.round(rawValue);

  itemIdCounter += 1;

  return {
    id: `item_${Date.now()}_${itemIdCounter}`,
    slot,
    rarityKey,
    rarityLabel: rarity.label,
    color: rarity.color,
    name: `${rarity.label} ${template.namePrefix}`,
    bonuses: { [template.primaryStat]: statValue },
    sellValue: Math.max(1, Math.round(5 * rarity.statMultiplier)),
  };
}