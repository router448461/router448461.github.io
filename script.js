// Configuration
const CONFIG = {
  particleCount: 100,
  maxVelocity: 0.5,
  connectionDistance: 120,
  dotColor: 'rgba(255,255,255,0.7)',
  lineBaseAlpha: 0.15
};

// Setup canvas
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let width, height, particles;
const dpr = window.devicePixelRatio || 1;

// Resize handler
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// Particle class
class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * CONFIG.maxVelocity;
    this.vy = (Math.random() - 0.5) * CONFIG.maxVelocity;
    this.radius = 1 + Math.random() * 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // bounce off edges
    if (this.x < 0 || this.x > width)  this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.dotColor;
    ctx.fill();
  }
}

// Initialize particles
function initParticles() {
  particles = [];
  for (let i = 0; i < CONFIG.particleCount; i++) {
    particles.push(new Particle());
  }
}
initParticles();

// Main animation loop
function animate() {
  ctx.clearRect(0, 0, width, height);

  // Update and draw dots
  for (const p of particles) {
    p.update();
    p.draw();
  }

  // Draw lines between close particles
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);

      if (dist < CONFIG.connectionDistance) {
        const alpha = 1 - dist / CONFIG.connectionDistance;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(255,255,255,${alpha * CONFIG.lineBaseAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

animate();
