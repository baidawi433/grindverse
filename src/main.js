import { GameConfig } from "./config/GameConfig.js";
import { CombatConfig } from "./config/CombatConfig.js";
import { LootConfig } from "./config/EquipmentConfig.js";
import { createGameCanvas } from "./core/Canvas.js";
import { Renderer } from "./core/Renderer.js";
import { GameLoop } from "./core/GameLoop.js";
import { Camera } from "./core/Camera.js";
import { InputManager } from "./core/InputManager.js";
import { DamageNumbers } from "./core/DamageNumbers.js";
import { AreaNotice } from "./core/AreaNotice.js";
import { UpgradeManager } from "./core/UpgradeManager.js";
import { SkillManager } from "./core/SkillManager.js";
import { UpgradePanel } from "./ui/UpgradePanel.js";
import { InventoryPanel } from "./ui/InventoryPanel.js";
import { EquipmentPanel } from "./ui/EquipmentPanel.js";
import { SkillTreePanel } from "./ui/SkillTreePanel.js";
import { AutomationPanel } from "./ui/AutomationPanel.js";
import { calculatePlayerHit } from "./core/CombatSystem.js";
import { ComboSystem } from "./core/ComboSystem.js";
import { ParticleSystem } from "./core/ParticleSystem.js";
import { Inventory } from "./core/Inventory.js";
import { Equipment } from "./core/Equipment.js";
import { generateRandomItem } from "./core/ItemFactory.js";
import { AscensionManager } from "./core/AscensionManager.js";
import { AscensionPanel } from "./ui/AscensionPanel.js";
import { AscensionTreePanel } from "./ui/AscensionTreePanel.js";
import { Player } from "./entities/Player.js";
import { Boss } from "./entities/Boss.js";
import { GameMap } from "./world/GameMap.js";
import { EnemySpawner } from "./world/EnemySpawner.js";
import { AreaManager } from "./world/AreaManager.js";
import { DungeonManager } from "./world/DungeonManager.js";
import { ScreenShake } from "./core/ScreenShake.js";
import { SoundManager } from "./core/SoundManager.js";

console.log(`${GameConfig.name} v${GameConfig.version} - Booting...`);

const gameContainer = document.querySelector("#game-container");
const canvas = createGameCanvas();
gameContainer.appendChild(canvas);

const renderer = new Renderer(canvas);
const player = new Player();
const camera = new Camera(canvas.width, canvas.height);
const input = new InputManager(canvas);
const damageNumbers = new DamageNumbers();
const areaNotice = new AreaNotice();
const comboSystem = new ComboSystem();
const particleSystem = new ParticleSystem();
const screenShake = new ScreenShake();
const soundToggleBtn = document.querySelector("#sound-toggle-btn");
soundToggleBtn.addEventListener("click", () => {
  const enabled = soundManager.toggle();
  soundToggleBtn.textContent = enabled ? "🔊 Sound" : "🔇 Muted";
});

const areaManager = new AreaManager(player);
const dungeonManager = new DungeonManager();
const spawner = new EnemySpawner();

let currentArea = areaManager.getCurrentArea();
let inDungeon = false;
let floorClearPortal = null;
let currentBoss = null;
let phaseFlashTimer = 0;
let expandingRings = [];

function spawnExpandingRing(x, y, color) {
  expandingRings.push({
    x,
    y,
    color,
    startRadius: 10,
    growth: 60,
    life: 0.6,
    maxLife: 0.6,
  });
}
const map = new GameMap(currentArea.obstacles);
let enemies = spawner.spawnFromList(currentArea.spawns);

const inventory = new Inventory(20);
const equipment = new Equipment(player);

const upgradeManager = new UpgradeManager(player);
const skillManager = new SkillManager(player);
const ascensionManager = new AscensionManager(player);


function refreshAllPanels() {
  upgradePanel.render();
  inventoryPanel.render();
  equipmentPanel.render();
  skillTreePanel.render();
  automationPanel.render();
  ascensionPanel.render();
  ascensionTreePanel.render();
}

const upgradePanel = new UpgradePanel(upgradeManager);
const inventoryPanel = new InventoryPanel(inventory, equipment, refreshAllPanels);
const equipmentPanel = new EquipmentPanel(equipment, inventory, refreshAllPanels);
const skillTreePanel = new SkillTreePanel(skillManager, refreshAllPanels);
const automationPanel = new AutomationPanel(player);

function performAscension() {
  const soulGained = ascensionManager.performAscend();
  if (soulGained <= 0) return;

  soundManager.playAscend();
  spawnExpandingRing(player.x + player.width / 2, player.y + player.height / 2, "#a78bfa");
  particleSystem.burst(player.x + player.width / 2, player.y + player.height / 2, {
    count: 40,
    color: "#a78bfa",
    speed: 160,
    life: 0.8,
    size: 5,
  });

  // Reset RPG systems
  inventory.items = [];
  for (const slot of Object.keys(equipment.slots)) {
    equipment.slots[slot] = null;
  }
  skillManager.resetAll();
  skillManager.player.stats.skillPoints = 0; // resetAll() mengembalikan poin, tapi stats sudah direset total oleh Player

  // Reset upgrade manager (level upgrade biasa ikut reset, sesuai konsep prestige)
  for (const key of Object.keys(upgradeManager.levels)) {
    upgradeManager.levels[key] = 0;
  }

  // Kembali ke Village, keluar dari dungeon jika sedang di dalamnya
  dungeonManager.exit();
  inDungeon = false;
  floorClearPortal = null;
  currentBoss = null;
  areaManager.currentAreaId = "village";
  currentArea = areaManager.getCurrentArea();
  map.setObstacles(currentArea.obstacles);
  enemies = spawner.spawnFromList(currentArea.spawns);
  player.setPosition(currentArea.entryPoint.x, currentArea.entryPoint.y);
  camera.follow(player, currentArea);

  areaNotice.show(`✨ ASCENDED! +${soulGained} Soul. Semua bonus permanen tetap aktif!`, "#a78bfa");
  console.log(`Ascension selesai! +${soulGained} Soul. Total Soul: ${ascensionManager.soul}`);

  refreshAllPanels();
}

const ascensionPanel = new AscensionPanel(ascensionManager, player, performAscension);
const ascensionTreePanel = new AscensionTreePanel(ascensionManager, refreshAllPanels);

refreshAllPanels();

function findNearestEnemyInRange() {
  let nearest = null;
  let nearestDist = Infinity;

  for (const enemy of enemies) {
    if (!enemy.isAlive) continue;

    const a = player.getCenter();
    const b = enemy.getCenter();
    const dist = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);

    if (dist <= CombatConfig.playerAttackRange && dist < nearestDist) {
      nearest = enemy;
      nearestDist = dist;
    }
  }

  if (currentBoss && currentBoss.isAlive) {
    const a = player.getCenter();
    const b = currentBoss.getCenter();
    const dist = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
    if (dist <= CombatConfig.playerAttackRange && dist < nearestDist) {
      nearest = currentBoss;
    }
  }

  return nearest;
}

let itemIdCounter = 0;

function createUniqueLootItem(uniqueLoot) {
  itemIdCounter += 1;
  return {
    id: `unique_${Date.now()}_${itemIdCounter}`,
    slot: uniqueLoot.slot,
    rarityKey: uniqueLoot.rarityKey,
    rarityLabel: "Legendary",
    color: uniqueLoot.color,
    name: uniqueLoot.name,
    bonuses: { ...uniqueLoot.bonuses },
    sellValue: uniqueLoot.sellValue,
  };
}

function handleEnemyDeath(enemy) {
  const levelBefore = player.stats.level;
  const goldGained = player.gainGold(enemy.stats.goldReward);
  const xpGained = player.gainXp(enemy.stats.xpReward);
  console.log(`${enemy.name} dikalahkan! +${xpGained} XP, +${goldGained} Gold`);

  if (player.stats.level > levelBefore) {
    soundManager.playLevelUp();
    particleSystem.burst(player.x + player.width / 2, player.y + player.height / 2, {
      count: 24,
      color: "#facc15",
      speed: 120,
      life: 0.6,
      size: 4,
    });
    spawnExpandingRing(player.x + player.width / 2, player.y + player.height / 2, "#facc15");
  }

  if (enemy.isBoss) {
    const uniqueItem = createUniqueLootItem(enemy.uniqueLoot);
    const added = inventory.addItem(uniqueItem);

    areaNotice.show(`🏆 ${enemy.name} DIKALAHKAN! Kamu mendapat ${uniqueItem.name}!`, "#facc15");
    soundManager.playPortal();
    soundManager.playLoot();
    console.log(`BOSS DEFEATED! Unique loot: ${uniqueItem.name}`);

    if (!added) {
      console.log("Inventory penuh! Unique loot hilang. Pastikan inventory punya slot kosong sebelum melawan boss berikutnya.");
    }

    currentBoss = null;
  } else if (Math.random() < LootConfig.dropChance) {
    const item = generateRandomItem(enemy.level);
    const added = inventory.addItem(item);
    if (added) {
      console.log(`Loot didapat: ${item.name} (${item.rarityLabel})`);
      soundManager.playLoot();
    } else {
      console.log(`Inventory penuh, item ${item.name} tidak bisa diambil`);
    }
  }

  refreshAllPanels();
}

function performAttack(target, sourceLabel, damageMultiplier = 1) {
  player.triggerAttackAnim();
  soundManager.playAttack();

  const { damage, isCritical } = calculatePlayerHit(player);
  const finalDamage = Math.round(damage * damageMultiplier);
  const damageDealt = target.takeDamage(finalDamage);

  let color = isCritical ? "#facc15" : "#f87171";
  if (target.isBoss) {
    color = isCritical ? "#facc15" : "#fb7185";
  }

  damageNumbers.spawn(target.x + target.width / 2, target.y, damageDealt, color);
  particleSystem.burst(target.x + target.width / 2, target.y + target.height / 2, {
    count: isCritical ? 14 : 6,
    color,
    speed: 100,
    life: 0.4,
    size: isCritical ? 4 : 3,
  });

  console.log(
    `[${sourceLabel}] Player menyerang ${target.name} sebesar ${damageDealt} damage${isCritical ? " (CRITICAL!)" : ""}. HP: ${target.stats.hp}/${target.stats.maxHp}`
  );

  if (target.isBoss && target.phaseChanged) {
    areaNotice.show(`⚡ ${target.name} memasuki fase: ${target.phaseChanged.name}!`, "#ef4444");
    target.phaseChanged = null;
    phaseFlashTimer = 0.3;
  }

    if (!target.isAlive) {
    particleSystem.burst(target.x + target.width / 2, target.y + target.height / 2, {
      count: target.isBoss ? 40 : 16,
      color: target.color,
      speed: 140,
      life: 0.7,
      size: target.isBoss ? 6 : 4,
    });

    if (target.isBoss) {
      soundManager.playBossDefeat();
    } else {
      soundManager.playEnemyDeath();
    }

    handleEnemyDeath(target);
  }
}

function handlePlayerAttack() {
  if (!player.isAlive) return;
  if (!input.consumeAttackPress()) return;

  comboSystem.registerClick();

  if (comboSystem.comboCount > 0 && comboSystem.comboCount % CombatConfig.comboGoldBonusThreshold === 0) {
    const bonusGold = player.gainGold(CombatConfig.comboGoldBonusAmount);
    refreshAllPanels();
    console.log(`Combo Bonus! +${bonusGold} Gold (Combo x${comboSystem.comboCount})`);
  }

  const target = findNearestEnemyInRange();
  if (target) {
    performAttack(target, "CLICK", comboSystem.getDamageMultiplier());
  } else {
    console.log("Tidak ada enemy dalam jangkauan");
  }
}

function handleAutoAttack() {
  if (!player.isAlive) return;
  if (!player.canAutoAttack()) return;

  const target = findNearestEnemyInRange();
  if (target) {
    performAttack(target, "AUTO");
    player.resetAutoAttackCooldown();
  }
}

function overlapsBox(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function goToArea(areaId, entryPoint) {
  const switched = areaManager.switchTo(areaId);
  if (!switched) return false;

  inDungeon = false;
  floorClearPortal = null;
  currentBoss = null;
  currentArea = areaManager.getCurrentArea();
  map.setObstacles(currentArea.obstacles);
  enemies = spawner.spawnFromList(currentArea.spawns);

  const point = entryPoint || currentArea.entryPoint;
  player.setPosition(point.x, point.y);
  camera.follow(player, currentArea);

  areaNotice.show(`📍 Memasuki ${currentArea.name}`, "#38bdf8");
  console.log(`Berpindah ke area: ${currentArea.name}`);

  return true;
}

function loadDungeonFloor(floor) {
  currentArea = floor;
  floorClearPortal = null;
  currentBoss = null;
  map.setObstacles(floor.obstacles);
  enemies = spawner.spawnFromList(floor.spawns);
  player.setPosition(floor.entryPoint.x, floor.entryPoint.y);
  camera.follow(player, currentArea);

  if (floor.isBossFloor && floor.bossId) {
    currentBoss = new Boss(floor.bossId, floor.width / 2 - 32, 150);
    areaNotice.show(`⚠️ ${currentBoss.name} MUNCUL!`, "#ef4444");
    console.log(`Boss ${currentBoss.name} muncul di Floor ${floor.floorNumber}!`);
  }
}

function enterDungeon() {
  const floor = dungeonManager.enter();
  inDungeon = true;
  loadDungeonFloor(floor);

  if (!floor.isBossFloor) {
    areaNotice.show(`🏰 Memasuki Dungeon - ${floor.name}`, "#a855f7");
  }
  console.log(`Memasuki Dungeon Floor ${floor.floorNumber}`);
}

function exitDungeonToCave() {
  dungeonManager.exit();
  goToArea("cave", { x: 1900, y: 700 });
  areaNotice.show("🕳️ Keluar dari Dungeon", "#38bdf8");
}

function checkFloorClear() {
  if (!inDungeon || floorClearPortal) return;

  const currentFloor = dungeonManager.getCurrentFloor();
  if (currentFloor.isBossFloor) return; // ditangani terpisah lewat handleBossDefeat()

  if (enemies.length > 0 && dungeonManager.isFloorCleared(enemies)) {
    floorClearPortal = {
      x: currentArea.width - 100,
      y: currentArea.height / 2 - 75,
      width: 40,
      height: 150,
    };
    areaNotice.show("✅ Floor Bersih! Portal naik telah terbuka", "#4ade80");
    console.log(`Floor ${currentFloor.floorNumber} cleared!`);
  }
}

function checkFloorClear() {
  if (!inDungeon || floorClearPortal) return;

  const currentFloor = dungeonManager.getCurrentFloor();

  if (currentFloor.isBossFloor) {
    if (currentBoss === null && !floorClearPortal) {
      // Boss sudah dikalahkan (currentBoss di-null-kan di handleEnemyDeath)
      floorClearPortal = {
        x: currentArea.width - 100,
        y: currentArea.height / 2 - 75,
        width: 40,
        height: 150,
        isExitPortal: true,
      };
      areaNotice.show("🚪 Portal Keluar Dungeon telah terbuka!", "#4ade80");
    }
    return;
  }

  if (enemies.length > 0 && dungeonManager.isFloorCleared(enemies)) {
    floorClearPortal = {
      x: currentArea.width - 100,
      y: currentArea.height / 2 - 75,
      width: 40,
      height: 150,
    };
    areaNotice.show("✅ Floor Bersih! Portal naik telah terbuka", "#4ade80");
    console.log(`Floor ${currentFloor.floorNumber} cleared!`);
  }
}

function handleFloorPortal() {
  if (!floorClearPortal) return;

  const playerBox = { x: player.x, y: player.y, width: player.width, height: player.height };
  if (!overlapsBox(playerBox, floorClearPortal)) return;

  if (floorClearPortal.isExitPortal) {
    exitDungeonToCave();
    return;
  }

  const nextFloor = dungeonManager.goToNextFloor();
  if (nextFloor) {
    loadDungeonFloor(nextFloor);
    if (!nextFloor.isBossFloor) {
      areaNotice.show(`🏰 ${nextFloor.name}`, "#a855f7");
    }
    console.log(`Naik ke Dungeon Floor ${nextFloor.floorNumber}`);
  }
}

function handleFloorPortal() {
  if (!floorClearPortal) return;

  const playerBox = { x: player.x, y: player.y, width: player.width, height: player.height };
  if (overlapsBox(playerBox, floorClearPortal)) {
    const nextFloor = dungeonManager.goToNextFloor();
    if (nextFloor) {
      loadDungeonFloor(nextFloor);
      if (!nextFloor.isBossFloor) {
        areaNotice.show(`🏰 ${nextFloor.name}`, "#a855f7");
      }
      console.log(`Naik ke Dungeon Floor ${nextFloor.floorNumber}`);
    }
  }
}

function handlePortals() {
  if (inDungeon) {
    handleFloorPortal();
    return;
  }

  const playerBox = { x: player.x, y: player.y, width: player.width, height: player.height };

  for (const portal of currentArea.portals || []) {
    if (overlapsBox(playerBox, portal)) {
      if (areaManager.isUnlocked(portal.toArea)) {
        goToArea(portal.toArea);
      } else {
        const targetArea = areaManager.getArea(portal.toArea);
        areaNotice.show(
          `🔒 Butuh Level ${targetArea.requiredLevel} untuk masuk ${targetArea.name}`,
          "#f87171"
        );
        soundManager.playError();
      }
      return;
    }
  }

  if (currentArea.dungeonEntry && overlapsBox(playerBox, currentArea.dungeonEntry)) {
    enterDungeon();
  }
}

function update(deltaTime) {
  const direction = input.getMovementDirection();
  const playerHpBefore = player.stats.hp;

  player.update(deltaTime, direction, map, currentArea);
  camera.follow(player, currentArea);

  for (const enemy of enemies) {
    enemy.update(deltaTime, { player, map, worldBounds: currentArea });
  }

  if (currentBoss && currentBoss.isAlive) {
    currentBoss.update(deltaTime, {
      player,
      map,
      worldBounds: currentArea,
      onSpecialHit: (dmg) => {
        damageNumbers.spawn(player.x + player.width / 2, player.y - 10, dmg, "#dc2626");
      },
    });
  }

  if (player.stats.hp < playerHpBefore) {
    const dmg = Math.round(playerHpBefore - player.stats.hp);
    damageNumbers.spawn(player.x + player.width / 2, player.y, dmg, "#fb923c");
    particleSystem.burst(player.x + player.width / 2, player.y + player.height / 2, {
      count: 6,
      color: "#fb923c",
      speed: 70,
      life: 0.35,
      size: 3,
    });

    const shakeIntensity = Math.min(14, dmg / 4);
    screenShake.trigger(shakeIntensity, 0.2);
  }

  handlePlayerAttack();
  handleAutoAttack();
  handlePortals();
  checkFloorClear();
  damageNumbers.update(deltaTime);
  particleSystem.update(deltaTime);
  for (const ring of expandingRings) {
    ring.life -= deltaTime;
  }
  expandingRings = expandingRings.filter((r) => r.life > 0);
  screenShake.update(deltaTime);
  comboSystem.update(deltaTime);
  areaNotice.update(deltaTime);

  if (phaseFlashTimer > 0) {
   phaseFlashTimer -= deltaTime;
  }

  enemies = enemies.filter((e) => e.isAlive);
}

// Di dalam render(), tambahkan phaseFlashTimer ke objek yang dikirim
function render() {
  renderer.render({
    player,
    camera,
    map,
    enemies,
    damageNumbers,
    comboSystem,
    area: currentArea,
    areaNotice,
    dungeonInfo: inDungeon
      ? { floorNumber: dungeonManager.currentFloorNumber, totalFloors: 10 }
      : null,
    floorClearPortal,
    boss: currentBoss,
    phaseFlashTimer,
    particleSystem,
    screenShake,
    expandingRings,
  });
}

const gameLoop = new GameLoop({ update, render });
gameLoop.start();

import { getElapsedOfflineSeconds, saveLastActiveTime } from "./core/SaveTimestamp.js";
import { calculateOfflineProgress } from "./core/OfflineProgressCalculator.js";
import { OfflineModal } from "./ui/OfflineModal.js";

const offlineModal = new OfflineModal();
const elapsedOffline = getElapsedOfflineSeconds();
const offlineProgress = calculateOfflineProgress(elapsedOffline, player);

if (offlineProgress) {
  offlineModal.show(offlineProgress, () => {
    const goldGained = player.gainGold(offlineProgress.goldEarned);
    const xpGained = player.gainXp(offlineProgress.xpEarned);
    console.log(`Offline progress diklaim: +${goldGained} Gold, +${xpGained} XP`);
    refreshAllPanels();
  });
}

window.addEventListener("beforeunload", saveLastActiveTime);
setInterval(saveLastActiveTime, 10000);

console.log(`GRINDVERSE - Game loop dimulai di area ${currentArea.name} dengan ${enemies.length} enemy`);