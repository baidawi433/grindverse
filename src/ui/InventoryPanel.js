export class InventoryPanel {
  constructor(inventory, equipment, onChange) {
    this.inventory = inventory;
    this.equipment = equipment;
    this.onChange = onChange;
    this.container = document.querySelector("#inventory-list");
    this.sellAllButton = document.querySelector("#sell-all-common-btn");

    this.sellAllButton.addEventListener("click", () => this.sellAllCommon());
  }

  sellAllCommon() {
    const commonItems = this.inventory.items.filter((i) => i.rarityKey === "common");

    if (commonItems.length === 0) {
      console.log("Tidak ada item Common untuk dijual");
      return;
    }

    let totalGold = 0;
    for (const item of commonItems) {
      this.inventory.removeItem(item.id);
      totalGold += item.sellValue;
    }

    this.equipment.player.gainGold(totalGold);
    console.log(`Sold ${commonItems.length} item Common seharga total 💰 ${totalGold}`);
    this.onChange();
  }

  render() {
    this.container.innerHTML = "";

    if (this.inventory.items.length === 0) {
      this.container.innerHTML = `<div class="empty-text">Inventory kosong</div>`;
      return;
    }

    for (const item of this.inventory.items) {
      const el = document.createElement("div");
      el.className = "inventory-item";

      const bonusText = Object.entries(item.bonuses)
        .map(([stat, val]) => `+${val} ${stat}`)
        .join(", ");

      el.title = `${item.name} (${item.rarityLabel || item.rarityKey})\n${bonusText}`;
      el.innerHTML = `
        <div class="item-name" style="color:${item.color}">${item.name}</div>
        <div class="item-desc">${bonusText} · slot: ${item.slot}</div>
        <div class="item-actions">
          <button class="equip-btn">Equip</button>
          <button class="sell-btn">Sell (💰 ${item.sellValue})</button>
        </div>
      `;

      el.querySelector(".equip-btn").addEventListener("click", () => {
        this.equipment.equip(item, this.inventory);
        this.onChange();
      });

      el.querySelector(".sell-btn").addEventListener("click", () => {
        this.inventory.removeItem(item.id);
        this.equipment.player.gainGold(item.sellValue);
        this.onChange();
      });

      this.container.appendChild(el);
    }
  }
}