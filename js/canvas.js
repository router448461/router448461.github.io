const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Set initial size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Handle resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const width = canvas.width;
const height = canvas.height;

export { canvas, ctx, width, height };
