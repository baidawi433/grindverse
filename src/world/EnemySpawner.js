import { Enemy } from "../entities/Enemy.js";

export class EnemySpawner {
  spawnFromList(spawnList = []) {
    if (!spawnList || spawnList.length === 0) return [];
    return spawnList.map((s) => new Enemy(s.type, s.x, s.y));
  }
}