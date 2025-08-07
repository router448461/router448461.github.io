// js/particle.js

export class Particle {
  constructor(x, y, config) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.config = config;

    // each dot gets a random phase for pulsing
    this.pulseOffset = Math.random() * Math.PI * 2;
  }

  applyForce(force) {
    this.acceleration.x += force.x;
    this.acceleration.y += force.y;
  }

  update() {
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;

    this.velocity.x *= this.config.particle.drag;
    this.velocity.y *= this.config.particle.drag;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.acceleration.x = 0;
    this.acceleration.y = 0;
  }
}
