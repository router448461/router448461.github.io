// SVG moving dots along path using getPointAtLength
const svg = document.getElementById('svgLines');
const path1 = document.getElementById('p1');
const path2 = document.getElementById('p2');
const dotPrimary = svg.querySelector('.dot--primary');
const dotSecondary = svg.querySelector('.dot--secondary');
const speedControl = document.getElementById('svgSpeed');
const restartBtn = document.getElementById('svgRestart');

let speed = parseFloat(speedControl.value); // multiplier
let t = 0; // normalized time 0..1
let last = performance.now();
let running = true;

// precompute lengths
const L1 = path1.getTotalLength();
const L2 = path2.getTotalLength();

// place dots initially
function placeDot(circle, point){
  circle.setAttribute('cx', point.x);
  circle.setAttribute('cy', point.y);
}

// update loop
function frame(now){
  const dt = (now - last) / 1000;
  last = now;
  if(running){
    t += dt * 0.12 * speed; // base speed factor
    if(t > 1) t = 0;
  }

  // primary dot follows path1
  const p = path1.getPointAtLength(L1 * t);
  placeDot(dotPrimary, p);

  // secondary dot follows path2 with phase offset
  const t2 = (t + 0.45) % 1;
  const p2 = path2.getPointAtLength(L2 * t2);
  placeDot(dotSecondary, p2);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// controls
speedControl.addEventListener('input', (e) => {
  speed = parseFloat(e.target.value);
});
restartBtn.addEventListener('click', () => {
  t = 0;
  // retrigger draw animation
  const lines = svg.querySelectorAll('.line');
  lines.forEach((ln) => {
    ln.style.animation = 'none';
    // force reflow
    void ln.offsetWidth;
    ln.style.animation = '';
  });
});
