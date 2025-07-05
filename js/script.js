// Initialize Leaflet map centered on ancient Canaan
const map = L.map('map', {
  center: [31.8, 35.4],
  zoom: 7,
  zoomControl: false,
  attributionControl: false
});

// Dark basemap for ominous feel
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 10,
  tileSize: 512,
  zoomOffset: -1
}).addTo(map);

// Ancient city sites
const sites = [
  { name: 'Jericho', coords: [31.8667, 35.4500] },
  { name: 'Ai',      coords: [31.9077, 35.2790] },
  { name: 'Hazor',   coords: [32.8650, 35.5350] }
];

// Add pulsing blips
sites.forEach(s => {
  const icon = L.divIcon({
    className: 'site-marker',
    html: '<div class="blip"></div>'
  });
  L.marker(s.coords, { icon, interactive: false }).addTo(map);
});

// Troop movement line (green dashed)
L.polyline([
  [31.9,   35.2],
  [31.9077,35.2790],
  [31.8667,35.4500]
], {
  color: '#39ff14',
  weight: 2,
  dashArray: '6,4'
}).addTo(map);

// Arrowhead at end of line
const arrowIcon = L.divIcon({
  className: 'arrow-icon',
  html: '&#9654;'
});
L.marker([31.87, 35.44], { icon: arrowIcon, interactive: false }).addTo(map);

// Generate scrolling binary code
function genBinary(length = 200) {
  return Array.from({ length }, () => (Math.random() > 0.5 ? '1' : '0')).join(' ');
}
const binEl = document.getElementById('binary');
binEl.textContent = genBinary();

setInterval(() => {
  binEl.textContent = genBinary();
}, 2500);

console.log('🛡️ Joshua’s military map is live.');
