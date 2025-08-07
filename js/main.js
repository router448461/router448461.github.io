// js/main.js
import config from './config.js';
import { Particle } from './particle.js';
import { Renderer } from './Renderer.js';

const canvas   = document.getElementById('background');
const renderer = new Renderer(canvas, config, []);

// resize handler (must run before spawn)
function resize() {
  const w = Math.floor(window.innerWidth  * config.pixelRatio);
  const h = Math.floor(window.innerHeight * config.pixelRatio);
  renderer.resize(w, h);
}
window.addEventListener('resize', resize);
resize();

// spawn particles on a jittered grid
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

// main animation loop
function animate(ts) {
  const t = ts / 1000;  // seconds

  // update physics (no extra forces in this version)
  for (const p of particles) {
    p.update();
  }

  renderer.clear();
  renderer.draw(t);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
