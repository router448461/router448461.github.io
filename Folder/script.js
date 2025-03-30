// Initialize the map
const map = L.map('map', {
  center: [0, 0], // Center of the world
  zoom: 2, // Default zoom level
  zoomControl: false, // Disable zoom controls
  dragging: false, // Disable dragging
  scrollWheelZoom: false, // Disable scroll wheel zoom
  doubleClickZoom: false, // Disable double-click zoom
  boxZoom: false, // Disable box zoom
  keyboard: false, // Disable keyboard navigation
  touchZoom: false, // Disable touch zoom
  attributionControl: false // Hide attribution
});

// Add a dark tile layer to the map
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// Handle canvas for red-line animation
const canvas = document.getElementById('animation');
const ctx = canvas.getContext('2d');

// Adjust canvas size
function adjustCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
adjustCanvasSize(); // Initial sizing
window.addEventListener('resize', adjustCanvasSize); // Resize dynamically

// Function to draw red lines converging to the center
function drawLines() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;

  for (let i = 0; i < 360; i += 10) {
    const angle = (i * Math.PI) / 180;
    const x = centerX + Math.cos(angle) * canvas.width;
    const y = centerY + Math.sin(angle) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(centerX, centerY);
    ctx.stroke();
  }
}

// Draw red lines after resizing
window.addEventListener('resize', drawLines);
drawLines(); // Initial draw
