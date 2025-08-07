import config from './config.js';
import { noise } from './noise.js';
import { Particle } from './particle.js';
import { Renderer } from './renderer.js';
import { InputManager } from './inputManager.js';

const canvas = document.getElementById('background');
const renderer = new Renderer(canvas, config);
const input = new InputManager(canvas);

// Hoisted function declaration
function resize() {
  canvas.width  = window.innerWidth  * config.pixelRatio;
  canvas.height = window.innerHeight * config.pixelRatio;
  renderer.resize(canvas.width, canvas.height);
}

// Attach listener after resize is defined
window.addEventListener('resize', resize);

// Run once to kick things off
resize();

// Initialize particles
const particles = [];
for (let i = 0; i < config.particleCount; i++) {
  particles.push(new Particle(config));
}

// Animation loop
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
