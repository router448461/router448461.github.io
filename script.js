// timing: 3 steps in 1s
const cycleTime = 1000 / 3;
const body       = document.body;
const overlay    = document.getElementById('region-overlay');
const pulseWord  = document.getElementById('pulse-word');
const container  = document.getElementById('map-container');
const canvas     = document.getElementById('globeCanvas');

const regions = ['region1','region2','region3','region4'];
const words   = ['BLACK','&','WHITE'];
let   step    = 0;

// ─── THREE.JS GLOBE SETUP ───────────────────
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// a simple sphere with world texture as placeholder
const loader  = new THREE.TextureLoader();
loader.load(
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1024px-World_map_-_low_resolution.svg.png',
  tex => {
    const geo  = new THREE.SphereGeometry(5, 64, 64);
    const mat  = new THREE.MeshStandardMaterial({ map: tex, flatShading: false });
    const globe= new THREE.Mesh(geo, mat);
    scene.add(globe);
  }
);

// lights
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dirL = new THREE.DirectionalLight(0xffffff, 0.6);
dirL.position.set(10,10,10);
scene.add(dirL);

// position camera
camera.position.z = 12;

// handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── PARALLAX (mouse + device-tilt) ─────────
const targetRot = { x:0, y:0 };
document.addEventListener('mousemove', e => {
  const nx = (e.clientY/window.innerHeight - 0.5) * 0.4;
  const ny = (e.clientX/window.innerWidth  - 0.5) * 0.4;
  targetRot.x = nx;
  targetRot.y = ny;
});
window.addEventListener('deviceorientation', e => {
  // gamma: left/right tilt, beta: front/back
  targetRot.y = THREE.MathUtils.degToRad(e.gamma || 0) * 0.02;
  targetRot.x = THREE.MathUtils.degToRad(e.beta  || 0) * 0.02;
});

// render loop
function animate() {
  requestAnimationFrame(animate);
  // smooth rotate toward target
  scene.rotation.x += (targetRot.x - scene.rotation.x) * 0.05;
  scene.rotation.y += (targetRot.y - scene.rotation.y) * 0.05;
  renderer.render(scene, camera);
}
animate();

// ─── PULSE + MAP FLASH LOGIC ───────────────
setInterval(() => {
  if (step === 0) {
    body.classList.replace('white','black');
    pulseWord.textContent = words[0];
  }
  else if (step === 1) {
    body.classList.replace('black','white');
    overlay.className = regions[Math.floor(Math.random()*regions.length)];
    pulseWord.textContent = words[1];
  }
  else {
    // remain white for the 3rd flash
    overlay.className = regions[Math.floor(Math.random()*regions.length)];
    pulseWord.textContent = words[2];
  }

  // show + hide text
  pulseWord.style.opacity = 1;
  setTimeout(() => { pulseWord.style.opacity = 0; }, cycleTime - 50);

  step = (step + 1) % 3;
}, cycleTime);
