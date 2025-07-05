// Initialize Leaflet map
const map = L.map('map', {
  center: [20, 0],
  zoom: 1.3,
  zoomControl: false,
  attributionControl: false,
});

// Use a light, Apple-like tile set (CartoDB Positron)
L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    maxZoom: 5,
    tileSize: 512,
    zoomOffset: -1,
  }
).addTo(map);

console.log('🔥 World-on-Fire map initialized via Leaflet.');
