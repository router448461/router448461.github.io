// js/main.js

import config from './config.js';
import { noise } from './noise.js';
import { Particle } from './particle.js';
import { Renderer } from './Renderer.js';
import { InputManager } from './inputManager.js';

const canvas   = document.getElementById('background');
const renderer = new Renderer(canvas, config);
const input    = new InputManager(canvas);

// Resize handler must be declared before use
function resize() {
  const w = Math.floor(window.innerWidth  * config.pixelRatio);
  const h = Math.floor(window.innerHeight * config.pixelRatio);
  renderer.resize(w, h);
}

window.addEventListener('resize', resize);
resize();

// spawn particles
const particles = Array.from(
  { length: config.particleCount },
  () => new Particle(config)
);

function animate() {
  input.update();
  renderer.clear();

  for (const p of particles) {
    // apply noise-driven force
    const force = noise(p.position, input.pointer);
    p.applyForce(force);

    p.update();
    // insert into spatial grid for future neighbor queries
    renderer.grid.insert(p);
  }

  renderer.drawParticles(particles);
  requestAnimationFrame(animate);
}

animate();
