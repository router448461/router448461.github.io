import { Tendril } from './tendril.js';

const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');
let width, height;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const tendrils = [];
const origin = { x: width / 2, y: height / 2 };
const mouse = { x: origin.x, y: origin.y };

for (let i = 0; i < 30; i++) {
  tendrils.push(new Tendril(origin, {
    length: 25,
    spacing: 8 + Math.random() * 4,
    damping: 0.1 + Math.random() * 0.05,
    attraction: 0.15 + Math.random() * 0.05
  }));
}

canvas.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function animate() {
  ctx.clearRect(0, 0, width, height);
  for (const tendril of tendrils) {
    tendril.update(mouse);
    tendril.draw(ctx);
  }
  requestAnimationFrame(animate);
}
animate();
