const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');
let width, height;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const particles = [];
const center = { x: width / 2, y: height / 2 };
const mouse = { x: center.x, y: center.y };

for (let i = 0; i < 100; i++) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  particles.push(new Particle(x, y));
}

canvas.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function animate() {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.update(center, mouse);
    p.draw(ctx);

    for (let j = i + 1; j < particles.length; j++) {
      Line.draw(ctx, p, particles[j]);
    }
  }

  requestAnimationFrame(animate);
}
animate();
