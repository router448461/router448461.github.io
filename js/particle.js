// js/particle.js

export class Particle {
  constructor(config) {
    // random starting position within the viewport
    const w = window.innerWidth * config.pixelRatio;
    const h = window.innerHeight * config.pixelRatio;

    this.position = {
      x: Math.random() * w,
      y: Math.random() * h
    };
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.config = config;
  }

  applyForce(force) {
    this.acceleration.x += force.x;
    this.acceleration.y += force.y;
  }

  update() {
    // integrate acceleration → velocity → position
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;

    // apply drag
    this.velocity.x *= this.config.particle.drag;
    this.velocity.y *= this.config.particle.drag;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.wrap();
    this.acceleration.x = 0;
    this.acceleration.y = 0;
  }

  wrap() {
    const w = window.innerWidth * this.config.pixelRatio;
    const h = window.innerHeight * this.config.pixelRatio;

    if (this.position.x < 0) this.position.x += w;
    if (this.position.x > w) this.position.x -= w;
    if (this.position.y < 0) this.position.y += h;
    if (this.position.y > h) this.position.y -= h;
  }
}
