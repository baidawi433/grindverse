export const RarityConfig = {
  common: { label: "Common", color: "#9ca3af", statMultiplier: 1, dropWeight: 50 },
  uncommon: { label: "Uncommon", color: "#22c55e", statMultiplier: 1.3, dropWeight: 30 },
  rare: { label: "Rare", color: "#3b82f6", statMultiplier: 1.7, dropWeight: 14 },
  epic: { label: "Epic", color: "#a855f7", statMultiplier: 2.2, dropWeight: 5 },
  legendary: { label: "Legendary", color: "#f97316", statMultiplier: 3, dropWeight: 0.9 },
  mythic: { label: "Mythic", color: "#ef4444", statMultiplier: 4, dropWeight: 0.1 },
};

export const EquipmentSlots = ["weapon", "helmet", "armor", "gloves", "boots", "ring"];

export const ItemTemplates = {
  weapon: { namePrefix: "Sword", primaryStat: "attack", baseValue: 3 },
  helmet: { namePrefix: "Helmet", primaryStat: "defense", baseValue: 2 },
  armor: { namePrefix: "Armor", primaryStat: "defense", baseValue: 3 },
  gloves: { namePrefix: "Gloves", primaryStat: "attack", baseValue: 2 },
  boots: { namePrefix: "Boots", primaryStat: "moveSpeed", baseValue: 10 },
  ring: { namePrefix: "Ring", primaryStat: "criticalChance", baseValue: 0.01 },
};

export const LootConfig = {
  dropChance: 0.5,
};