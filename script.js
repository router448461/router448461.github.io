// script.js
const fireCanvas = document.getElementById('fire-canvas');
const iceCanvas  = document.getElementById('ice-canvas');
const fCtx = fireCanvas.getContext('2d');
const iCtx = iceCanvas.getContext('2d');

let midY, domeRadius;

// Resize canvases to full viewport
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  [fireCanvas, iceCanvas].forEach(canvas => {
    canvas.width  = w;
    canvas.height = h;
  });
  midY = h / 2;
  domeRadius = Math.min(w * 0.45, h * 0.4);
}
window.addEventListener('resize', resize);
resize();

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class FireParticle extends Particle {
  constructor() {
    super(
      Math.random() * fireCanvas.width,
      fireCanvas.height + Math.random() * 100
    );
    this.vx   = (Math.random() - 0.5) * 1;
    this.vy   = - (2 + Math.random() * 2);
    this.life = 60 + Math.random() * 40;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.y < midY || this.life <= 0) {
      Object.assign(this, new FireParticle());
    }
  }

  draw(ctx) {
    const grd = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, 20
    );
    grd.addColorStop(0, 'rgba(255,200,0,0.8)');
    grd.addColorStop(1, 'rgba(255,50,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

class SnowParticle extends Particle {
  constructor() {
    super(
      Math.random() * iceCanvas.width,
      -10 - Math.random() * iceCanvas.height * 0.1
    );
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = 1 + Math.random() * 1.5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    const dx = this.x - iceCanvas.width / 2;
    const dy = this.y - midY;
    if (dx * dx + dy * dy > domeRadius * domeRadius) {
      Object.assign(this, new SnowParticle());
    }
  }

  draw(ctx) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

const fireParticles = Array.from({ length: 120 }, () => new FireParticle());
const snowParticles = Array.from({ length: 200 }, () => new SnowParticle());

function animate() {
  // Clear & draw fire
  fCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
  fireParticles.forEach(p => { p.update(); p.draw(fCtx); });

  // Clear & draw snow within dome
  iCtx.clearRect(0, 0, iceCanvas.width, iceCanvas.height);
  iCtx.save();
  iCtx.beginPath();
  iCtx.arc(iceCanvas.width / 2, midY, domeRadius, Math.PI, 0);
  iCtx.clip();
  snowParticles.forEach(p => { p.update(); p.draw(iCtx); });
  iCtx.restore();

  // Outline the ice dome
  iCtx.beginPath();
  iCtx.arc(iceCanvas.width / 2, midY, domeRadius, Math.PI, 0);
  iCtx.strokeStyle = 'white';
  iCtx.lineWidth = 4;
  iCtx.stroke();

  requestAnimationFrame(animate);
}

animate();
