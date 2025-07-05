// ── GLOBAL SETUP ──
const body      = document.body;
const dataRain  = document.getElementById('dataRain');
const emberCanv = document.getElementById('embers');
const scan      = document.getElementById('scanlines');
const tickerMsg = document.querySelector('#ticker .message');
const rippleDiv = document.getElementById('ripple');

const words   = ['BLACK','&','WHITE'];
let   step    = 0;
const cycle   = 1000/3;

// resize canvases
function resize() {
  [dataRain, emberCanv].forEach(c => {
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
  });
}
window.addEventListener('resize', resize);
resize();

// ── MATRIX RAIN ──
const rainCtx = dataRain.getContext('2d');
const cols    = Math.floor(innerWidth/20);
const drops   = Array(cols).fill(0);

function drawRain() {
  rainCtx.fillStyle = 'rgba(0,0,0,0.05)';
  rainCtx.fillRect(0,0,innerWidth,innerHeight);
  rainCtx.fillStyle = '#0f0';
  rainCtx.font = '15px monospace';
  drops.forEach((y,i) => {
    const char = Math.random()>0.5?'0':'1';
    rainCtx.fillText(char, i*20, y);
    drops[i] = y > innerHeight + Math.random()*1000 ? 0 : y + 20;
  });
  requestAnimationFrame(drawRain);
}
drawRain();

// ── EMBER SYSTEM ──
const emberCtx = emberCanv.getContext('2d');
class Ember {
  constructor(){ this.reset(); }
  reset(){
    this.x = Math.random()*innerWidth;
    this.y = innerHeight + Math.random()*200;
    this.vx= (Math.random()-0.5)*0.3;
    this.vy= - (1 + Math.random()*2);
    this.a = 0.5 + Math.random()*0.5;
    this.s = 1 + Math.random()*2;
  }
  update(){
    this.x += this.vx; this.y += this.vy; this.a -= 0.005;
    if(this.a<=0) this.reset();
  }
  draw(){
    emberCtx.fillStyle = `rgba(255,140,0,${this.a})`;
    emberCtx.beginPath();
    emberCtx.arc(this.x,this.y,this.s,0,2*Math.PI);
    emberCtx.fill();
  }
}
const embers = Array.from({length:150}, ()=>new Ember());
function drawEmbers(){
  emberCtx.clearRect(0,0,innerWidth,innerHeight);
  embers.forEach(e=>{ e.update(); e.draw(); });
  requestAnimationFrame(drawEmbers);
}
drawEmbers();

// ember repulsion on hover
window.addEventListener('mousemove', e => {
  embers.forEach(e2 => {
    const dx = e2.x - e.clientX, dy = e2.y - e.clientY;
    const dist = Math.hypot(dx,dy);
    if(dist < 100){
      e2.vx += (dx/dist)*0.1;
      e2.vy += (dy/dist)*0.1;
    }
  });
});

// ── FLASH & TICKER ──
setInterval(()=>{
  if(step===0){
    body.classList.replace('white','black');
    tickerMsg.textContent = words[0];
  }
  else {
    body.classList.replace('black','white');
    tickerMsg.textContent = words[step];
    // glitch & RGB split
    scan.style.animationPlayState = 'running';
    document.getElementById('mapImage')
      .classList.add('split-channels');
    document.getElementById('fireBG')
      .classList.add('split-channels');
  }

  setTimeout(()=>{
    document.getElementById('mapImage')
      .classList.remove('split-channels');
    document.getElementById('fireBG')
      .classList.remove('split-channels');
  }, 300);

  // fade ticker in/out
  const tickerEl = document.getElementById('ticker');
  tickerEl.style.opacity = '1';
  setTimeout(()=> tickerEl.style.opacity = '0', cycle - 50);

  step = (step + 1) % 3;
}, cycle);

// ── CLICK RIPPLE ──
window.addEventListener('click', e => {
  rippleDiv.style.left = e.clientX + 'px';
  rippleDiv.style.top  = e.clientY + 'px';
  rippleDiv.classList.remove('active');
  // restart
  void rippleDiv.offsetWidth;
  rippleDiv.classList.add('active');
});
