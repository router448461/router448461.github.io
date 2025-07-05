// SETUP EMBER CANVAS
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
  constructor(){ this.reset(); }
  reset(){
    this.x     = Math.random()*canvas.width;
    this.y     = canvas.height + Math.random()*200;
    this.vx    = (Math.random()-0.5)*0.3;
    this.vy    = - (1 + Math.random()*2);
    this.alpha = 0.4 + Math.random()*0.6;
    this.size  = 2 + Math.random()*3;
  }
  update(){
    this.x += this.vx; this.y += this.vy; this.alpha -= 0.005;
    if(this.alpha <= 0) this.reset();
  }
  draw(){
    // radial gradient for flame shape
    const r = this.size * 2;
    const grad = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, r
    );
    grad.addColorStop(0,   `rgba(255,255,200,${this.alpha})`);
    grad.addColorStop(0.3, `rgba(255,140,0,${this.alpha*0.6})`);
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI*2);
    ctx.fill();
  }
}

// create & animate lots of embers
const embers = Array.from({ length: 300 }, () => new Ember());
function animateEmbers(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  embers.forEach(e => { e.update(); e.draw(); });
  requestAnimationFrame(animateEmbers);
}
animateEmbers();

// pointer repulsion
window.addEventListener('mousemove', e => {
  embers.forEach(e2 => {
    const dx = e2.x - e.clientX, dy = e2.y - e.clientY;
    const d  = Math.hypot(dx,dy);
    if(d < 120){
      e2.vx += (dx/d)*0.1;
      e2.vy += (dy/d)*0.1;
    }
  });
});

// click ripple
const ripple = document.getElementById('ripple');
window.addEventListener('click', e => {
  ripple.style.left = e.clientX + 'px';
  ripple.style.top  = e.clientY + 'px';
  ripple.classList.remove('active');
  void ripple.offsetWidth;  // reflow
  ripple.classList.add('active');
});
