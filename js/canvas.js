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

export { canvas, ctx, canvas as default, canvas.width as width, canvas.height as height };
