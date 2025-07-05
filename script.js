// Ember particle system
const canvas = document.getElementById('embers');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

class Ember {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random()*canvas.width;
    this.y = canvas.height + Math.random()*200;
    this.vx = (Math.random()-0.5)*0.3;
    this.vy = - (1 + Math.random()*2);
    this.alpha = 0.5 + Math.random()*0.5;
    this.size = 1 + Math.random()*2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.005;
    if (this.alpha <= 0) this.reset();
  }
  draw() {
    ctx.fillStyle = `rgba(255,140,0,${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI);
    ctx.fill();
  }
}

const embers = Array.from({ length: 100 }, () => new Ember());

function animateEmbers() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  embers.forEach(e => { e.update(); e.draw(); });
  requestAnimationFrame(animateEmbers);
}
animateEmbers();

// periodic screen shake
setInterval(() => {
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 500);
}, 5000);

// mute/unmute
const ambient = document.getElementById('ambient');
const muteBtn = document.getElementById('mute-btn');
muteBtn.addEventListener('click', () => {
  ambient.muted = !ambient.muted;
  muteBtn.textContent = ambient.muted ? '🔈' : '🔇';
});
