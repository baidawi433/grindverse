const MAX_PARTICLES = 150; // batas untuk performa, lihat TASK 9

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  burst(x, y, options = {}) {
    const {
      count = 8,
      color = "#f87171",
      speed = 80,
      life = 0.5,
      size = 3,
    } = options;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) {
        this.particles.shift(); // buang partikel tertua jika sudah penuh
      }

      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.5 + Math.random() * 0.5);

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color,
        size: size * (0.7 + Math.random() * 0.6),
        life,
        maxLife: life,
      });
    }
  }

  update(deltaTime) {
    for (const p of this.particles) {
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vx *= 0.92; // gesekan, partikel melambat
      p.vy *= 0.92;
      p.life -= deltaTime;
    }

    this.particles = this.particles.filter((p) => p.life > 0);
  }
}