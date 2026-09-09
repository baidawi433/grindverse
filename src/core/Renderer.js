import { MapConfig } from "../config/MapConfig.js";
import { formatNumber } from "./NumberFormat.js";

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  clear() {
    const { ctx, canvas } = this;
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawWorldBackground(area) {
    const { ctx } = this;
    ctx.fillStyle = area.backgroundColor;
    ctx.fillRect(0, 0, area.width, area.height);

    ctx.strokeStyle = area.gridColor;
    ctx.lineWidth = 1;

    for (let x = 0; x <= area.width; x += area.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, area.height);
      ctx.stroke();
    }

    for (let y = 0; y <= area.height; y += area.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(area.width, y);
      ctx.stroke();
    }
  }

  drawPortals(area) {
    const { ctx } = this;
    for (const portal of area.portals || []) {
      ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
      ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.strokeRect(portal.x, portal.y, portal.width, portal.height);
    }

    if (area.dungeonEntry) {
      const d = area.dungeonEntry;
      ctx.fillStyle = "rgba(168, 85, 247, 0.35)";
      ctx.fillRect(d.x, d.y, d.width, d.height);
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2;
      ctx.strokeRect(d.x, d.y, d.width, d.height);
    }
  }

  drawFloorClearPortal(portal) {
    if (!portal) return;
    const { ctx } = this;
    const pulse = 0.5 + 0.3 * Math.sin(Date.now() / 200);
    const color = portal.isExitPortal ? "56, 189, 248" : "74, 222, 128";

    ctx.fillStyle = `rgba(${color}, ${pulse})`;
    ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
    ctx.strokeStyle = portal.isExitPortal ? "#38bdf8" : "#4ade80";
    ctx.lineWidth = 2;
    ctx.strokeRect(portal.x, portal.y, portal.width, portal.height);
  }

  drawMap(map) {
    const { ctx } = this;
    ctx.fillStyle = MapConfig.obstacleColor;
    for (const obstacle of map.obstacles) {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  }

    drawPlayer(player) {
    const { ctx } = this;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    const center = player.getCenter();
    const size = 6;
    ctx.fillStyle = "#fde047";
    ctx.beginPath();

    if (player.facing === "up") {
      ctx.moveTo(center.x, player.y - size);
      ctx.lineTo(center.x - size, player.y);
      ctx.lineTo(center.x + size, player.y);
    } else if (player.facing === "down") {
      const bottom = player.y + player.height;
      ctx.moveTo(center.x, bottom + size);
      ctx.lineTo(center.x - size, bottom);
      ctx.lineTo(center.x + size, bottom);
    } else if (player.facing === "left") {
      ctx.moveTo(player.x - size, center.y);
      ctx.lineTo(player.x, center.y - size);
      ctx.lineTo(player.x, center.y + size);
    } else if (player.facing === "right") {
      const right = player.x + player.width;
      ctx.moveTo(right + size, center.y);
      ctx.lineTo(right, center.y - size);
      ctx.lineTo(right, center.y + size);
    }

    ctx.closePath();
    ctx.fill();

    if (player.attackAnimTimer > 0) {
      const progress = 1 - player.attackAnimTimer / 0.15;
      const radius = player.width * 0.9;
      const startAngle = -0.6 + progress * 1.2;
      const arcLength = 1.0;

      let baseAngle = 0;
      if (player.facing === "up") baseAngle = -Math.PI / 2;
      else if (player.facing === "down") baseAngle = Math.PI / 2;
      else if (player.facing === "left") baseAngle = Math.PI;
      else baseAngle = 0;

      ctx.strokeStyle = `rgba(253, 224, 71, ${1 - progress})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, baseAngle + startAngle, baseAngle + startAngle + arcLength);
      ctx.stroke();
    }
  }

  drawEnemies(enemies) {
    const { ctx } = this;

    for (const enemy of enemies) {
      if (!enemy.isAlive || enemy.isBoss) continue;

      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      const barWidth = enemy.width;
      const barHeight = 4;
      const barX = enemy.x;
      const barY = enemy.y - 8;
      const hpRatio = Math.max(0, enemy.stats.hp / enemy.stats.maxHp);

      ctx.fillStyle = "#1f2937";
      ctx.fillRect(barX, barY, barWidth, barHeight);

      ctx.fillStyle = "#ef4444";
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

      ctx.fillStyle = "#e5e7eb";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(enemy.name, enemy.x + enemy.width / 2, barY - 4);
    }
  }

  drawBoss(boss) {
    if (!boss || !boss.isAlive) return;
    const { ctx } = this;

    if (boss.isTelegraphing) {
      const pulse = 0.3 + 0.3 * Math.sin(Date.now() / 80);
      const center = boss.getCenter();
      ctx.beginPath();
      ctx.arc(center.x, center.y, boss.specialAttackConfig.range, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
      ctx.fill();
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = boss.color;
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 3;
    ctx.strokeRect(boss.x, boss.y, boss.width, boss.height);
  }

  drawDamageNumbers(damageNumbers) {
    const { ctx } = this;

    for (const num of damageNumbers.numbers) {
      const alpha = Math.max(0, num.life / num.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = num.color;
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`-${formatNumber(num.amount)}`, num.x, num.y);
      ctx.globalAlpha = 1;
    }
  }

  drawTopBar(player, comboSystem, area, dungeonInfo) {
    const { ctx, canvas } = this;

    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(0, 0, canvas.width, 50);

    const barX = 16;
    const barY = 16;
    const barWidth = 200;
    const barHeight = 18;
    const hpRatio = Math.max(0, player.stats.hp / player.stats.maxHp);

    ctx.fillStyle = "#374151";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = player.isAlive ? "#22c55e" : "#6b7280";
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    ctx.strokeStyle = "#111827";
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      `${Math.max(0, Math.round(player.stats.hp))}/${player.stats.maxHp}`,
      barX + barWidth / 2,
      barY + 13
    );

    ctx.fillStyle = "#facc15";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Lv.${player.stats.level}`, barX + barWidth + 16, barY + 14);

    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`💰 ${player.stats.gold}`, barX + barWidth + 80, barY + 14);

    ctx.fillStyle = "#4ade80";
    ctx.fillText(`💰 ${formatNumber(player.stats.gold)}`, barX + barWidth + 80, barY + 14);

    if (comboSystem && comboSystem.comboCount > 0) {
      ctx.fillStyle = "#f472b6";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(`COMBO x${comboSystem.comboCount}`, barX + barWidth + 240, barY + 14);
    }

    ctx.textAlign = "right";
    if (dungeonInfo) {
      ctx.fillStyle = "#a855f7";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(`🏰 Floor ${dungeonInfo.floorNumber}/${dungeonInfo.totalFloors}`, canvas.width - 16, barY + 14);
    } else if (area) {
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(`📍 ${area.name}`, canvas.width - 16, barY + 14);
    }
  }

  drawBossHealthBar(boss) {
    if (!boss || !boss.isAlive) return;

    const { ctx, canvas } = this;
    const barWidth = Math.min(500, canvas.width - 80);
    const barHeight = 22;
    const barX = (canvas.width - barWidth) / 2;
    const barY = canvas.height - 50;

    const hpRatio = Math.max(0, boss.stats.hp / boss.stats.maxHp);
    const phase = boss.getCurrentPhase();

    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(barX - 10, barY - 24, barWidth + 20, barHeight + 34);

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${boss.name} — ${phase.name}`, canvas.width / 2, barY - 8);

    ctx.fillStyle = "#374151";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#dc2626";
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px monospace";
    ctx.fillText(
  `${formatNumber(Math.max(0, boss.stats.hp))}/${formatNumber(boss.stats.maxHp)}`,
  canvas.width / 2,
  barY + 16
);
  }

  drawAreaNotice(areaNotice) {
    if (!areaNotice || !areaNotice.message) return;

    const { ctx, canvas } = this;
    const alpha = Math.max(0, areaNotice.life / areaNotice.maxLife);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(canvas.width / 2 - 170, 70, 340, 36);

    ctx.fillStyle = areaNotice.color || "#facc15";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(areaNotice.message, canvas.width / 2, 93);
    ctx.globalAlpha = 1;
  }

  drawBossWarning(area) {
    if (!area || !area.isBossFloor) return;

    const { ctx, canvas } = this;
    const pulse = 0.15 + 0.1 * Math.sin(Date.now() / 300);

    ctx.strokeStyle = `rgba(239, 68, 68, ${pulse + 0.3})`;
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
  }

  drawPhaseFlash(phaseFlashTimer) {
    if (!phaseFlashTimer || phaseFlashTimer <= 0) return;

    const { ctx, canvas } = this;
    const alpha = Math.min(0.35, phaseFlashTimer);

    ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

    drawParticles(particleSystem) {
    if (!particleSystem) return;
    const { ctx } = this;

    for (const p of particleSystem.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.globalAlpha = 1;
    }
  }

    drawParticles(particleSystem) {
    if (!particleSystem) return;
    const { ctx } = this;

    for (const p of particleSystem.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.globalAlpha = 1;
    }
  }

  drawDebugHUD(player, camera) {
    const { ctx } = this;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Player: x=${Math.round(player.x)} y=${Math.round(player.y)}`, 10, 65);
    ctx.fillText(`Camera: x=${Math.round(camera.x)} y=${Math.round(camera.y)}`, 10, 80);
  }

    drawExpandingRings(rings) {
    if (!rings || rings.length === 0) return;
    const { ctx } = this;

    for (const ring of rings) {
      const progress = 1 - ring.life / ring.maxLife;
      const radius = ring.startRadius + progress * ring.growth;
      const alpha = Math.max(0, ring.life / ring.maxLife);

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

    render({ player, camera, map, enemies, damageNumbers, comboSystem, area, areaNotice, dungeonInfo, floorClearPortal, boss, phaseFlashTimer, particleSystem, screenShake, expandingRings }) {
    const { ctx } = this;

    this.clear();

    const shakeOffset = screenShake ? screenShake.getOffset() : { x: 0, y: 0 };

    ctx.save();
    ctx.translate(-camera.x + shakeOffset.x, -camera.y + shakeOffset.y);

    this.drawWorldBackground(area);
    this.drawPortals(area);
    this.drawFloorClearPortal(floorClearPortal);
    this.drawMap(map);
    this.drawEnemies(enemies);
    this.drawBoss(boss);
    this.drawPlayer(player);
    this.drawDamageNumbers(damageNumbers);
    this.drawParticles(particleSystem);
    this.drawExpandingRings(expandingRings);

    ctx.restore();

    this.drawTopBar(player, comboSystem, area, dungeonInfo);
    this.drawBossHealthBar(boss);
    this.drawAreaNotice(areaNotice);
    this.drawBossWarning(area);
    this.drawPhaseFlash(phaseFlashTimer);
    this.drawDebugHUD(player, camera);
  }
}