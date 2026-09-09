import { OfflineConfig } from "../config/OfflineConfig.js";

export function saveLastActiveTime() {
  try {
    localStorage.setItem(OfflineConfig.storageKey, String(Date.now()));
  } catch (e) {
    console.warn("Tidak bisa menyimpan waktu terakhir main:", e);
  }
}

export function getElapsedOfflineSeconds() {
  try {
    const stored = localStorage.getItem(OfflineConfig.storageKey);
    if (!stored) return 0;

    const lastActive = parseInt(stored, 10);
    if (isNaN(lastActive)) return 0;

    const elapsedMs = Date.now() - lastActive;
    return Math.max(0, Math.floor(elapsedMs / 1000));
  } catch (e) {
    console.warn("Tidak bisa membaca waktu terakhir main:", e);
    return 0;
  }
}