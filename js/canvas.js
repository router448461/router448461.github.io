const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Retina scaling
const scale = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * scale;
canvas.height = window.innerHeight * scale;
canvas.style.width = window.innerWidth + 'px';
canvas.style.height = window.innerHeight + 'px';
ctx.scale(scale, scale);

// Resize handler
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth * scale;
  canvas.height = window.innerHeight * scale;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(scale, scale);
});

const width = window.innerWidth;
const height = window.innerHeight;

export { canvas, ctx, width, height };
