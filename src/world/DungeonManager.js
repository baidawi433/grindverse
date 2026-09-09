import { DungeonConfig } from "../config/DungeonConfig.js";

export class DungeonManager {
  constructor() {
    this.active = false;
    this.currentFloorNumber = 1;
  }

  enter() {
    this.active = true;
    this.currentFloorNumber = 1;
    return this.getCurrentFloor();
  }

  exit() {
    this.active = false;
  }

  getCurrentFloor() {
    return DungeonConfig.floors.find((f) => f.floorNumber === this.currentFloorNumber);
  }

  isLastFloor() {
    return this.currentFloorNumber >= DungeonConfig.totalFloors;
  }

  goToNextFloor() {
    if (this.isLastFloor()) return null;
    this.currentFloorNumber += 1;
    return this.getCurrentFloor();
  }

  isFloorCleared(enemies) {
    return enemies.every((e) => !e.isAlive);
  }
}