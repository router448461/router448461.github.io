// script.js

// ── GLOBAL SETUP ─────────────────────────────

// DOM refs
const body       = document.body;
const globeCanv  = document.getElementById('globeCanvas');
const dataRain   = document.getElementById('dataRain');
const emberCanv  = document.getElementById('embers');
const scanlines  = document.getElementById('scanlines');
const ticker     = document.querySelector('.message');
const rippleDiv  = document.getElementById('ripple');

const regions    = ['region1','region2','region3','region4'];
const words      = ['BLACK','&','WHITE'];
let   step       = 0;

// canvas contexts
const rainCtx    = dataRain.getContext('2d');
const emberCtx   = emberCanv.getContext('2d');

// size canvases
function resize() {
  [globeCanv, dataRain, emberCanv].forEach(c => {
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
  });
}
window.addEventListener('resize', resize);
resize();

// ── THREE.JS GLOBE ───────────────────────────
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(30, innerWidth/innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: globeCanv, antialias:true, alpha:true });
renderer.setSize(innerWidth, innerHeight);

// simple textured sphere
new THREE.TextureLoader().load(
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1024px-World_map_-_low_resolution.svg.png',
  tex => {
    const geo = new THREE.SphereGeometry(5, 64,64);
    const mat = new THREE.MeshStandardMaterial({ map:tex, flatShading:false });
    const globe = new THREE.Mesh(geo, mat);
    scene.add(globe);
  }
);

// lights
scene.add(new THREE.AmbientLight(0xffffff,0.7));
const dir = new THREE.DirectionalLight(0xffffff,0.5);
dir.position.set(10,10,10);
scene.add(dir);

// position cam
camera.position.z = 12;

// parallax targets
const targetRot = { x:0, y:0 };
document.addEventListener('mousemove', e => {
  targetRot.x = (e.clientY/innerHeight - 0.5)*0.4;
  targetRot.y = (e.clientX/innerWidth  - 0.5)*0.4;
});
window.addEventListener('deviceorientation', e => {
  targetRot.y = THREE.MathUtils.degToRad(e.gamma||0)*0.02;
  targetRot.x = THREE.MathUtils.degToRad(e.beta ||0)*0.02;
});

// render loop
function animate() {
  requestAnimationFrame(animate);
  scene.rotation.x += (targetRot.x - scene.rotation.x)*0.05;
  scene.rotation.y += (targetRot.y - scene.rotation.y)*0.05;
  renderer.render(scene, camera);
}
animate();

// ── MATRIX RAIN ──────────────────────────────
const cols = Math.floor(innerWidth/20);
const drops = Array(cols).fill(0);
function drawRain() {
  rainCtx.fillStyle = 'rgba(0,0,0,0.05)';
  rainCtx.fillRect(0,0,innerWidth,innerHeight);
  rainCtx.fillStyle = '#0f0';
  rainCtx.font = '15px monospace';
  drops.forEach((y, i) => {
    const text = Math.random()>0.5?'0':'1';
    const x = i*20;
    rainCtx.fillText(text,x,y);
    drops[i] = y > innerHeight + Math.random()*1000 ? 0 : y+20;
  });
  requestAnimationFrame(drawRain);
}
drawRain();

// ── EMBER PARTICLES ──────────────────────────
class Ember {
  constructor() { this.reset(); this.vx=0; this.vy=0; }
  reset() {
    this.x = Math.random()*innerWidth;
    this.y = innerHeight + Math.random()*200;
    this.vx = (Math.random()-0.5)*0.3;
    this.vy = - (1 + Math.random()*2);
    this.alpha = 0.5 + Math.random()*0.5;
    this.size = 1 + Math.random()*2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.005;
    if (this.alpha<=0) this.reset();
  }
  draw() {
    emberCtx.fillStyle = `rgba(255,140,0,${this.alpha})`;
    emberCtx.beginPath();
    emberCtx.arc(this.x,this.y,this.size,0,2*Math.PI);
    emberCtx.fill();
  }
}
const embers = Array.from({length:150}, ()=>new Ember());
function drawEmbers() {
  emberCtx.clearRect(0,0,innerWidth,innerHeight);
  embers.forEach(e=>{ e.update(); e.draw(); });
  requestAnimationFrame(drawEmbers);
}
drawEmbers();

// pointer repulsion
window.addEventListener('mousemove', e=>{
  embers.forEach(e2=>{
    const dx=e2.x-e.clientX, dy=e2.y-e.clientY;
    const dist=Math.hypot(dx,dy);
    if(dist<100){
      e2.vx += dx/dist*0.1;
      e2.vy += dy/dist*0.1;
    }
  });
});

// ── PULSE + EFFECTS ──────────────────────────
const cycleTime = 1000/3;

setInterval(()=>{
  // step 0: BLACK + “BLACK”
  if(step===0){
    body.classList.replace('white','black');
    ticker.textContent = words[0];
    // placeholder for audio trigger
    // triggerDeepRumble();
  }
  // step 1: WHITE + “&”
  else if(step===1){
    body.classList.replace('black','white');
    ticker.textContent = words[1];
    globeCanv.classList.add('split-channels');
    scanlines.style.animationPlayState = 'running';
  }
  // step 2: WHITE + “WHITE”
  else {
    body.classList.replace('black','white');
    ticker.textContent = words[2];
    globeCanv.classList.add('split-channels');
  }

  // remove split-channel class
  setTimeout(()=>{
    globeCanv.classList.remove('split-channels');
  }, 300);

  // fade ticker
  ticker.parentElement.style.opacity = '1';
  setTimeout(()=> ticker.parentElement.style.opacity='0', cycleTime-50);

  step = (step+1)%3;
}, cycleTime);

// ── CLICK “BURN” RIPPLE ──────────────────────
window.addEventListener('click', e=>{
  rippleDiv.style.left = e.clientX+'px';
  rippleDiv.style.top  = e.clientY+'px';
  rippleDiv.classList.remove('active');
  // restart animation
  void rippleDiv.offsetWidth;
  rippleDiv.classList.add('active');
});

// (Optional) placeholder functions for audio
function triggerDeepRumble(){
  // e.g. play rumble sample
}
function triggerWhispers(){
  // e.g. play whisper sample
}
