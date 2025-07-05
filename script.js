// Setup ember canvas
const canvas = document.getElementById('embers');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Ember class
class Ember {
  constructor(){
    this.reset();
  }
  reset(){
    this.x     = Math.random() * canvas.width;
    this.y     = canvas.height + Math.random() * 200;
    this.vx    = (Math.random() - 0.5) * 0.3;
    this.vy    = - (1 + Math.random() * 2);
    this.alpha = 0.5 + Math.random() * 0.5;
    this.size  = 1 + Math.random() * 2;
  }
  update(){
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.005;
    if(this.alpha <= 0) this.reset();
  }
  draw(){
    ctx.fillStyle = `rgba(255,140,0,${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }
}

// Create embers
const embers = Array.from({ length: 150 }, () => new Ember());

// Animate embers
function animateEmbers(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  embers.forEach(e => { e.update(); e.draw(); });
  requestAnimationFrame(animateEmbers);
}
animateEmbers();

// Ember repulsion on pointer
window.addEventListener('mousemove', e => {
  embers.forEach(e2 => {
    const dx   = e2.x - e.clientX,
          dy   = e2.y - e.clientY,
          dist = Math.hypot(dx, dy);
    if(dist < 100){
      e2.vx += (dx/dist) * 0.1;
      e2.vy += (dy/dist) * 0.1;
    }
  });
});

// Ripple on click (“burn hotspot”)
const ripple = document.getElementById('ripple');
window.addEventListener('click', e => {
  ripple.style.left = e.clientX + 'px';
  ripple.style.top  = e.clientY + 'px';
  ripple.classList.remove('active');
  // restart animation
  void ripple.offsetWidth;
  ripple.classList.add('active');
});
