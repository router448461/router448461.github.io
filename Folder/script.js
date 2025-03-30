// Import Leaflet.js for the map
const map = L.map('map', {
  center: [0, 0], // Center of the world
  zoom: 2,
  zoomControl: false, // Disable zoom controls
  dragging: false, // Disable dragging
  scrollWheelZoom: false, // Disable scroll zoom
  doubleClickZoom: false, // Disable double-click zoom
  boxZoom: false, // Disable box zoom
  keyboard: false, // Disable keyboard navigation
  touchZoom: false, // Disable touch zoom
  attributionControl: false // Hide attribution
});

// Add a dark-themed tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// Animation logic
const canvas = document.getElementById('animation');
const ctx = canvas.getContext('2d');

// Adjust canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Cross-browser compatibility for media queries (if needed in future features)
if (window.matchMedia("(max-width: 600px)").matches) {
  console.log("You're in mobile view.");
}

// Draw red lines converging to the center
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

// Redraw lines on resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawLines();
});

// Initial draw
drawLines();
