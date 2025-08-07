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
for (let i = 0; i < 80; i++) {
  const x = Math.random() * width;
  const y = Math.random() * height;
  particles.push(new Particle(x, y));
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.update(width, height);
    p.draw(ctx);

    for (let j = i + 1; j < particles.length; j++) {
      Line.draw(ctx, p, particles[j]);
    }
  }

  requestAnimationFrame(animate);
}
animate();
