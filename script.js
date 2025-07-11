// script.js
const fireCanvas = document.getElementById('fire-canvas');
const iceCanvas  = document.getElementById('ice-canvas');
const fCtx = fireCanvas.getContext('2d');
const iCtx = iceCanvas.getContext('2d');

let midY, domeRadius;

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  [fireCanvas, iceCanvas].forEach(c => {
    c.width  = w;
    c.height = h;
  });
  midY = h / 2;
  domeRadius = Math.min(w * 0.45, h * 0.4);
}

window.addEventListener('resize', resize);
resize();

class Particle { … }
class FireParticle extends Particle { … }
class SnowParticle extends Particle { … }

const fireParticles = Array.from({ length: 120 }, () => new FireParticle());
const snowParticles = Array.from({ length: 200 }, () => new SnowParticle());

function animate() {
  // update + draw fire
  fCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
  fireParticles.forEach(p => { p.update(); p.draw(fCtx); });

  // update + draw snow in dome
  iCtx.clearRect(0, 0, iceCanvas.width, iceCanvas.height);
  iCtx.save();
  iCtx.beginPath();
  iCtx.arc(iceCanvas.width/2, midY, domeRadius, Math.PI, 0);
  iCtx.clip();
  snowParticles.forEach(p => { p.update(); p.draw(iCtx); });
  iCtx.restore();

  // dome outline
  iCtx.beginPath();
  iCtx.arc(iceCanvas.width/2, midY, domeRadius, Math.PI, 0);
  iCtx.strokeStyle = 'white';
  iCtx.lineWidth = 4;
  iCtx.stroke();

  requestAnimationFrame(animate);
}

animate();
