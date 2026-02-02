const canvas = document.getElementById('linesCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
const particleCountInput = document.getElementById('particleCount');
const restartBtn = document.getElementById('canvasRestart');

let DPR = Math.max(1, window.devicePixelRatio || 1);
let particles = [];
let particleCount = parseInt(particleCountInput.value, 10);
let running = true;

function resize(){
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * DPR);
  canvas.height = Math.floor(rect.height * DPR);
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// particle constructor
function Particle(x, y, vx, vy, size, hue){
  this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.size = size; this.hue = hue;
  this.history = [];
}
Particle.prototype.step = function(dt){
  // simple wandering motion
  this.x += this.vx * dt;
  this.y += this.vy * dt;
  // slight random acceleration
  this.vx += (Math.random() - 0.5) * 0.02;
  this.vy += (Math.random() - 0.5) * 0.02;
  // bounds wrap
  if(this.x < -20) this.x = canvas.width/DPR + 20;
  if(this.x > canvas.width/DPR + 20) this.x = -20;
  if(this.y < -20) this.y = canvas.height/DPR + 20;
  if(this.y > canvas.height/DPR + 20) this.y = -20;

  // record history for trailing line
  this.history.push({x:this.x, y:this.y});
  if(this.history.length > 12) this.history.shift();
};

function spawnParticles(n){
  particles = [];
  for(let i=0;i<n;i++){
    const x = Math.random() * canvas.width / DPR;
    const y = Math.random() * canvas.height / DPR;
    const speed = 10 + Math.random() * 40;
    const angle = Math.random() * Math.PI * 2;
    const vx = Math.cos(angle) * speed * 0.02;
    const vy = Math.sin(angle) * speed * 0.02;
    const size = 2 + Math.random() * 4;
    const hue = 180 + Math.random() * 120;
    particles.push(new Particle(x,y,vx,vy,size,hue));
  }
}

spawnParticles(particleCount);

// draw loop
let last = performance.now();
function draw(now){
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  ctx.clearRect(0,0,canvas.width/DPR,canvas.height/DPR);

  // draw soft background vignette
  const g = ctx.createLinearGradient(0,0,0,canvas.height/DPR);
  g.addColorStop(0, 'rgba(6,22,36,0.0)');
  g.addColorStop(1, 'rgba(4,8,14,0.25)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width/DPR,canvas.height/DPR);

  // update particles
  for(const p of particles){
    p.step(dt);
  }

  // draw connecting lines between nearby particles
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx*dx + dy*dy;
      if(d2 < 16000){ // threshold squared
        const alpha = 0.12 * (1 - d2 / 16000);
        ctx.strokeStyle = `rgba(79,70,229,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // draw trails and dots
  for(const p of particles){
    // trail
    ctx.beginPath();
    for(let i=0;i<p.history.length;i++){
      const h = p.history[i];
      if(i===0) ctx.moveTo(h.x, h.y);
      else ctx.lineTo(h.x, h.y);
    }
    ctx.strokeStyle = `rgba(6,182,212,0.08)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // dot
    const lastPos = p.history[p.history.length-1];
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(lastPos.x, lastPos.y, 0, lastPos.x, lastPos.y, p.size*4);
    gradient.addColorStop(0, `rgba(255,255,255,0.95)`);
    gradient.addColorStop(0.2, `hsla(${p.hue},90%,60%,0.9)`);
    gradient.addColorStop(1, `rgba(79,70,229,0)`);
    ctx.fillStyle = gradient;
    ctx.arc(lastPos.x, lastPos.y, p.size*2.6, 0, Math.PI*2);
    ctx.fill();
  }

  if(running) requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// controls
particleCountInput.addEventListener('input', (e) => {
  particleCount = parseInt(e.target.value, 10);
});
restartBtn.addEventListener('click', () => {
  spawnParticles(particleCount);
});
