function generateFloor(floorNumber) {
  const width = 1400;
  const height = 900;
  const isBossFloor = floorNumber === 10;

  const enemyPool = ["goblin", "skeleton", "wolf"];
  const enemyCount = Math.min(3 + floorNumber, 8);

  const spawns = [];
  if (!isBossFloor) {
    for (let i = 0; i < enemyCount; i++) {
      const type = enemyPool[i % enemyPool.length];
      const x = 150 + ((i * 180) % (width - 300));
      const y = 150 + Math.floor((i * 137) % (height - 300));
      spawns.push({ type, x, y });
    }
  }

  const obstacles = isBossFloor
    ? []
    : [
        { x: width / 2 - 40, y: 150, width: 80, height: 60 },
        { x: 200, y: height - 250, width: 70, height: 70 },
        { x: width - 270, y: height - 250, width: 70, height: 70 },
      ];

  return {
    floorNumber,
    name: isBossFloor ? "Boss Room" : `Floor ${floorNumber}`,
    width,
    height,
    backgroundColor: isBossFloor ? "#1a0505" : "#0a0a0f",
    gridColor: isBossFloor ? "#3f0d0d" : "#1c1c24",
    gridSize: 64,
    entryPoint: { x: 80, y: height / 2 },
    obstacles,
    spawns,
    isBossFloor,
    bossId: isBossFloor ? "forest_guardian" : null,
  };
}

export const DungeonConfig = {
  totalFloors: 10,
  floors: Array.from({ length: 10 }, (_, i) => generateFloor(i + 1)),
};