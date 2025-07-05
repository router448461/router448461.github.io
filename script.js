/*** Ember System ***/
class Ember {
  constructor(w, h) { this.w = w; this.h = h; this.reset(); }
  reset() {
    this.x     = Math.random() * this.w;
    this.y     = this.h + Math.random() * 200;
    this.vx    = (Math.random() - 0.5) * 0.2;
    this.vy    = - (1 + Math.random() * 2);
    this.alpha = 0.3 + Math.random() * 0.7;
    this.size  = 1 + Math.random() * 3;
  }
  update() {
    this.x += this.vx;  this.y += this.vy;  this.alpha -= 0.004;
    if (this.alpha <= 0) this.reset();
  }
  draw(ctx) {
    const r = this.size * 1.2;
    const grad = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, r
    );
    grad.addColorStop(0,   `rgba(255,255,200,${this.alpha})`);
    grad.addColorStop(0.15, `rgba(255,140,0,${this.alpha})`);
    grad.addColorStop(0.3,  `rgba(255,69,0,${this.alpha * 0.8})`);
    grad.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, 2 * Math.PI);
    ctx.fill();
  }
}

class EmberSystem {
  constructor(selector) {
    this.canvas = document.getElementById(selector);
    this.ctx    = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    const reduced = window.matchMedia('(prefers-reduced-motion)').matches;
    const count   = reduced
                  ?  Math.floor(getComputedStyle(document.documentElement)
                             .getPropertyValue('--ember-base-count') / 7)
                  :  parseInt(getComputedStyle(document.documentElement)
                             .getPropertyValue('--ember-base-count'));
    this.embers  = Array.from({ length: count },
                      () => new Ember(this.w, this.h));
    this.animate();
    window.addEventListener('mousemove', e => this.repel(e));
  }

  resize() {
    this.w = this.canvas.width  = window.innerWidth;
    this.h = this.canvas.height = window.innerHeight;
  }

  repel(e) {
    for (const ember of this.embers) {
      const dx = ember.x - e.clientX,
            dy = ember.y - e.clientY,
            d  = Math.hypot(dx, dy);
      if (d < 120) {
        ember.vx += (dx / d) * 0.1;
        ember.vy += (dy / d) * 0.1;
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.w, this.h);
    for (const ember of this.embers) {
      ember.update();
      ember.draw(this.ctx);
    }
    requestAnimationFrame(() => this.animate());
  }
}

// fire it up
new EmberSystem('embers');

// Ripple effect on click
const ripple = document.getElementById('ripple');
window.addEventListener('click', e => {
  ripple.style.left = `${e.clientX}px`;
  ripple.style.top  = `${e.clientY}px`;
  ripple.classList.remove('active');
  void ripple.offsetWidth;  // force reflow
  ripple.classList.add('active');
});
