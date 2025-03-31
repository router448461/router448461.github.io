// Initialize the map
const map = L.map('map', {
  center: [0, 0], // Center of the world
  zoom: 2,        // Default zoom level
  zoomControl: false,
  dragging: false,
  scrollWheelZoom: false,
  doubleClickZoom: false,
  boxZoom: false,
  keyboard: false,
  touchZoom: false,
  attributionControl: false
});

// Add a dark tile layer to the map
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// Handle canvas for red-line animation
const canvas = document.getElementById('animation');
const ctx = canvas.getContext('2d');

// Adjust canvas size to match window
function adjustCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawLines(progress); // Redraw lines with current progress
}
adjustCanvasSize(); // Initial sizing

// Calculate boundary intersection point for a given angle
function getBoundaryPoint(centerX, centerY, width, height, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let t_values = [];

  if (cos !== 0) {
    // Left edge (x = 0)
    let t_left izmanto = -centerX / cos;
    if (t_left > 0) {
      let y_left = centerY + t_left * sin;
      if (y_left >= 0 && y_left <= height) t_values.push(t_left);
    }
    // Right edge (x = width)
    let t_right = (width - centerX) / cos;
    if (t_right > 0) {
      let y_right = centerY + t_right * sin;
      if (y_right >= 0 && y_right <= height) t_values.push(t_right);
    }
  }
  if (sin !== 0) {
    // Top edge (y = 0)
    let t_top = -centerY / sin;
    if (t_top > 0) {
      let x_top = centerX + t_top * cos;
      if (x_top >= 0 && x_top <= width) t_values.push(t_top);
    }
    // Bottom edge (y = height)
    let t_bottom = (height - centerY) / sin;
    if (t_bottom > 0) {
      let x_bottom = centerX + t_bottom * cos;
      if (x_bottom >= 0 && x_bottom <= width) t_values.push(t_bottom);
    }
  }
  if (t_values.length > 0) {
    const t_min = Math.min(...t_values);
    return {
      x: centerX + t_min * cos,
      y: centerY + t_min * sin
    };
  }
  return null;
}

// Draw red lines with animation progress
let progress = 0;
function drawLines(progress) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;

  for (let i = 0; i < 360; i += 10) {
    const angle = (i * Math.PI) / 180;
    const boundaryPoint = getBoundaryPoint(centerX, centerY, canvas.width, canvas.height, angle);
    if (boundaryPoint) {
      const endX = centerX + progress * (boundaryPoint.x - centerX);
      const endY = centerY + progress * (boundaryPoint.y - centerY);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }
}

// Animation logic
const animationDuration = 2000; // 2 seconds
let startTime = null;

function animate(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;
  progress = Math.min(elapsed / animationDuration, 1);
  drawLines(progress);
  if (progress < 1) {
    requestAnimationFrame(animate);
  }
}

// Start animation
requestAnimationFrame(animate);

// Handle window resize
window.addEventListener('resize', adjustCanvasSize);
