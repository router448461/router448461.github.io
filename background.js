const canvas = document.getElementById('tacticalGrid');
const ctx = canvas.getContext('2d');
let width, height;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let time = 0;

function drawGrid(delta) {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.15)';
  ctx.lineWidth = 1;

  const spacing = 40;
  const offset = Math.sin(time * 0.001) * 10;

  // Vertical lines
  for (let x = offset % spacing; x < width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = offset % spacing; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Diagonal shimmer layer
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.03)';
  for (let i = -height; i < width; i += spacing * 2) {
    ctx.beginPath();
    ctx.moveTo(i + offset, 0);
    ctx.lineTo(i + height + offset, height);
    ctx.stroke();
  }
}

function loop(timestamp) {
  time = timestamp;
  drawGrid();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
