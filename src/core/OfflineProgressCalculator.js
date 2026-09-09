import { OfflineConfig } from "../config/OfflineConfig.js";

export function calculateOfflineProgress(elapsedSeconds, player) {
  if (elapsedSeconds < OfflineConfig.minOfflineSeconds) {
    return null;
  }

  const maxSeconds = OfflineConfig.maxOfflineHours * 3600;
  const cappedSeconds = Math.min(elapsedSeconds, maxSeconds);
  const hours = cappedSeconds / 3600;

  const offlineMultiplier = player.ascensionBonuses ? player.ascensionBonuses.offlineMultiplier : 1;

  const kills = Math.round(hours * OfflineConfig.killsPerHourEstimate * offlineMultiplier);
  const goldEarned = Math.round(kills * OfflineConfig.goldPerKillEstimate * player.stats.goldMultiplier * (player.ascensionBonuses?.goldMultiplier || 1));
  const xpEarned = Math.round(kills * OfflineConfig.xpPerKillEstimate * player.stats.xpMultiplier * (player.ascensionBonuses?.xpMultiplier || 1));

  return {
    elapsedSeconds,
    cappedSeconds,
    hours,
    kills,
    goldEarned,
    xpEarned,
    wasCapped: elapsedSeconds > maxSeconds,
  };
}

export function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${totalSeconds}s`;
}