export class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  follow(target, worldBounds) {
    const center = target.getCenter();

    let targetX = center.x - this.viewportWidth / 2;
    let targetY = center.y - this.viewportHeight / 2;

    targetX = Math.max(0, Math.min(targetX, worldBounds.width - this.viewportWidth));
    targetY = Math.max(0, Math.min(targetY, worldBounds.height - this.viewportHeight));

    this.x = targetX;
    this.y = targetY;
  }
}