export class Inventory {
  constructor(maxSize = 20) {
    this.maxSize = maxSize;
    this.items = [];
  }

  addItem(item) {
    if (this.items.length >= this.maxSize) {
      return false;
    }
    this.items.push(item);
    return true;
  }

  removeItem(itemId) {
    const index = this.items.findIndex((i) => i.id === itemId);
    if (index === -1) return null;
    return this.items.splice(index, 1)[0];
  }

  getItem(itemId) {
    return this.items.find((i) => i.id === itemId) || null;
  }

  isFull() {
    return this.items.length >= this.maxSize;
  }
}