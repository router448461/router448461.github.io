// Entry point for the tactical background animation

import config from './config.js';
import { noise } from './noise.js';
import { Particle } from './particle.js';
import { Renderer } from './renderer.js';
import { InputManager } from './inputManager.js';

const canvas = document.getElementById('background');
const renderer = new Renderer(canvas, config);
const input = new InputManager(canvas);

// Initialize particle system
const particles = [];
for (let i = 0; i < config.particleCount; i++) {
  particles.push(new Particle(config));
}

// Main loop
function animate() {
  input.update();
  for (const p of particles) {
    p.applyForce(noise(p.position, input.pointer));
    p.update(config);
  }
  renderer.clear();
  renderer.drawParticles(particles);
  requestAnimationFrame(animate);
}

animate();
