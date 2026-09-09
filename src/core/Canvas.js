import { GameConfig } from "../config/GameConfig.js";

export function createGameCanvas() {
  const canvas = document.createElement("canvas");
  canvas.id = "game-canvas";
  canvas.width = GameConfig.canvas.width;
  canvas.height = GameConfig.canvas.height;
  canvas.style.display = "block";
  canvas.style.margin = "0 auto";
  canvas.style.background = "#111827";
  canvas.style.border = "2px solid #374151";

  return canvas;
}