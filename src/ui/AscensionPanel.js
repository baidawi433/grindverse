import { AscensionConfig } from "../config/AscensionConfig.js";
import { formatNumber } from "../core/NumberFormat.js";

export class AscensionPanel {
  constructor(ascensionManager, player, onAscend) {
    this.ascensionManager = ascensionManager;
    this.player = player;
    this.onAscend = onAscend;
    this.infoContainer = document.querySelector("#ascension-info");
    this.ascendButton = document.querySelector("#ascend-btn");

    this.ascendButton.addEventListener("click", () => {
      if (!this.ascensionManager.canAscend()) return;

      const soulPreview = this.ascensionManager.calculateSoulReward();
      const confirmed = window.confirm(
        `Ascend sekarang?\n\nKamu akan mendapat ${soulPreview} Soul.\nLevel, Gold, Inventory, Equipment, dan Skill akan RESET total.\nBonus permanen dari Ascension Tree TIDAK hilang.\n\nLanjutkan?`
      );

      if (confirmed) {
        this.onAscend();
      }
    });
  }

  render() {
    const canAscend = this.ascensionManager.canAscend();
    const soulPreview = this.ascensionManager.calculateSoulReward();

    this.infoContainer.innerHTML = `
      <div style="font-size:13px; color:#a78bfa; margin-bottom:6px;">✨ Soul: ${formatNumber(this.ascensionManager.soul)}</div>
      <div style="font-size:11px; color:#9ca3af; margin-bottom:8px;">
        ${
          canAscend
            ? `Ascend sekarang untuk mendapat <b style="color:#facc15;">${soulPreview} Soul</b>`
            : `Butuh Level ${AscensionConfig.minLevelToAscend} untuk Ascend (saat ini Level ${this.player.stats.level})`
        }
      </div>
    `;

    this.ascendButton.disabled = !canAscend;
  }
}