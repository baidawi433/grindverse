export function calculatePlayerHit(player) {
  const isCritical = Math.random() < player.stats.criticalChance;
  const baseDamage = player.stats.attack;
  const critDamage = isCritical ? Math.round(baseDamage * player.stats.criticalDamage) : baseDamage;

  const ascensionMultiplier = player.ascensionBonuses ? player.ascensionBonuses.damageMultiplier : 1;
  const finalDamage = Math.round(critDamage * ascensionMultiplier);

  return { damage: finalDamage, isCritical };
}