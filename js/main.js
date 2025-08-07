// js/main.js

import config from './config.js';
import { Particle } from './particle.js';
import { Renderer } from './Renderer.js';

// setup canvas & renderer
const canvas = document.getElementById('background');
const renderer = new Renderer(canvas, config, []);

// resize logic
function resize() {
  const w = Math.floor(window.innerWidth  * config.pixelRatio);
  const h = Math.floor(window.innerHeight * config.pixelRatio);
  renderer.resize(w, h);
}
window.addEventListener('resize', resize);
resize();

// grid-spawn particles
const particles = [];
const cell = config.grid.cellSize;
for (let x = cell / 2; x < canvas.width; x += cell) {
  for (let y = cell / 2; y < canvas.height; y += cell) {
    const jitterX = (Math.random() - 0.5) * cell * 0.3;
    const jitterY = (Math.random() - 0.5) * cell * 0.3;
    particles.push(new Particle(x + jitterX, y + jitterY, config));
  }
}
renderer.particles = particles;

// animation loop
let last = 0;
function animate(timestamp) {
  const t = timestamp / 1000; // seconds
  const dt = t - last;
  last = t;

  // update physics
  for (const p of particles) {
    // optional noise force here, or skip for static grid
    p.update(dt);
  }

  renderer.clear();
  renderer.draw(t);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
