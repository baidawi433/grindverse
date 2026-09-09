import { formatNumber } from "../core/NumberFormat.js";
import { formatDuration } from "../core/OfflineProgressCalculator.js";

export class OfflineModal {
  constructor() {
    this.overlay = document.querySelector("#offline-modal-overlay");
    this.body = document.querySelector("#offline-modal-body");
    this.closeButton = document.querySelector("#offline-modal-close");
  }

  show(progress, onClaim) {
    const durationText = formatDuration(progress.cappedSeconds);
    const cappedNote = progress.wasCapped
      ? `<div style="color:#f87171; font-size:11px; margin-top:4px;">(dibatasi maksimum durasi offline)</div>`
      : "";

    this.body.innerHTML = `
      <div>⏱️ Kamu offline selama <b>${durationText}</b></div>
      <div style="margin-top:8px;">👹 ${progress.kills} musuh terkalahkan otomatis</div>
      <div>💰 +${formatNumber(progress.goldEarned)} Gold</div>
      <div>✨ +${formatNumber(progress.xpEarned)} XP</div>
      ${cappedNote}
    `;

    this.overlay.style.display = "flex";

    const handleClose = () => {
      this.overlay.style.display = "none";
      this.closeButton.removeEventListener("click", handleClose);
      onClaim();
    };

    this.closeButton.addEventListener("click", handleClose);
  }
}