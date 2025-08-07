import config from './config.js';
import { Particle } from './particle.js';
import { Renderer } from './renderer.js';
import { InputManager } from './inputManager.js';

const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');
let width, height;

function resize() {
  width  = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width  = width;
  canvas.height = height;
  if (renderer) {
    renderer.width  = width;
    renderer.height = height;
    renderer.applyHiDPI();
  }
}

window.addEventListener('resize', resize);
resize();

const input = new InputManager();
const renderer = new Renderer(ctx, width, height);

// Create layered particles
const allParticles = config.layers.map(layer => {
  return Array.from({ length: config.particleCount }, () =>
    new Particle(width, height, layer)
  );
});

function animate() {
  // update all particles
  for (const layerParticles of allParticles) {
    for (const p of layerParticles) {
      p.update(width, height, input.mouse);
    }
  }

  // render them
  renderer.render(allParticles);

  requestAnimationFrame(animate);
}

animate();
