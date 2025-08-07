// js/main.js

import config from './config.js';
import { Particle } from './particle.js';
import { Renderer } from './Renderer.js';

const canvas   = document.getElementById('background');
const renderer = new Renderer(canvas, config, []);

// 1) Resize handler
function resize() {
  const w = Math.floor(window.innerWidth  * config.pixelRatio);
  const h = Math.floor(window.innerHeight * config.pixelRatio);
  renderer.resize(w, h);
}
window.addEventListener('resize', resize);
resize();

// 2) Grid‐spawn with jitter
const particles = [];
const cell      = config.grid.cellSize;
for (let x = cell / 2; x < canvas.width; x += cell) {
  for (let y = cell / 2; y < canvas.height; y += cell) {
    const jx = (Math.random() - 0.5) * cell * 0.3;
    const jy = (Math.random() - 0.5) * cell * 0.3;
    particles.push(new Particle(x + jx, y + jy, config));
  }
}
renderer.particles = particles;

// 3) Animation loop calling draw(time)
function animate(timestamp) {
  const t = timestamp / 1000; // convert to seconds

  // update motion (if you have forces, apply them before update)
  for (const p of particles) {
    p.update();
  }

  renderer.clear();
  renderer.draw(t);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
