export class GameMap {
  constructor(obstacles = []) {
    this.obstacles = obstacles.map((o) => ({ ...o }));
  }

  setObstacles(obstacles) {
    this.obstacles = obstacles.map((o) => ({ ...o }));
  }

  checkCollision(box) {
    for (const obstacle of this.obstacles) {
      const overlap =
        box.x < obstacle.x + obstacle.width &&
        box.x + box.width > obstacle.x &&
        box.y < obstacle.y + obstacle.height &&
        box.y + box.height > obstacle.y;

      if (overlap) {
        return obstacle;
      }
    }
    return null;
  }
}