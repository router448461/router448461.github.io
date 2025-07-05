// EMBER SETUP
const canvas = document.getElementById('embers');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// EMBER CLASS
class Ember {
  constructor() { this.reset(); }
  reset() {
    this.x     = Math.random() * canvas.width;
    this.y     = canvas.height + Math.random() * 100;
    const minV = parseFloat(getComputedStyle(document.documentElement)
                   .getPropertyValue('--ember-speed-min'));
    const maxV = parseFloat(getComputedStyle(document.documentElement)
                   .getPropertyValue('--ember-speed-max'));
    this.vx    = (Math.random() - 0.5) * 0.3;
    this.vy    = -(minV + Math.random() * (maxV - minV));
    this.alpha = 0.3 + Math.random() * 0.7;
    this.size  = 1 + Math.random() * 3;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.01;
    if (this.alpha <= 0) this.reset();
  }
  draw() {
    const r = this.size * 1.2;
    const grad = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, r
    );
    grad.addColorStop(0,    `rgba(255,255,200,${this.alpha})`);
    grad.addColorStop(0.1,  `rgba(255,140,0,${this.alpha})`);
    grad.addColorStop(0.3,  `rgba(255,69,0,${this.alpha * 0.8})`);
    grad.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, 2 * Math.PI);
    ctx.fill();
  }
}

// SPAWN & ANIMATE
const count   = parseInt(getComputedStyle(document.documentElement)
               .getPropertyValue('--ember-count'), 10);
const embers  = Array.from({ length: count }, () => new Ember());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const e of embers) {
    e.update();
    e.draw();
  }
  requestAnimationFrame(animate);
}
animate();

// EMBER REPULSION
window.addEventListener('mousemove', e => {
  for (const ember of embers) {
    const dx = ember.x - e.clientX;
    const dy = ember.y - e.clientY;
    const d  = Math.hypot(dx, dy);
    if (d < 100) {
      ember.vx += (dx / d) * 0.2;
      ember.vy += (dy / d) * 0.2;
    }
  }
});

// CLICK RIPPLE EFFECT
const ripple = document.getElementById('ripple');
window.addEventListener('click', e => {
  ripple.style.left = e.clientX + 'px';
  ripple.style.top  = e.clientY + 'px';
  ripple.classList.remove('active');
  void ripple.offsetWidth;  // reflow
  ripple.classList.add('active');
});
