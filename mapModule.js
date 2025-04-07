import { throttle } from './utils.js';

export function initMap() {
  mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [0, 0],
    zoom: 1.5,
    attributionControl: false
  });
  
  map.dragPan.disable();
  map.dragRotate.disable();
  map.scrollZoom.disable();
  map.doubleClickZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  map.touchZoomRotate.disable();
  
  map.on('load', () => {
    const mapContainer = map.getContainer();
    mapContainer.addEventListener('mousemove', throttle(function (e) {
      const rect = mapContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const coords = map.unproject([mouseX, mouseY]);
      const lat = parseFloat(coords.lat);
      const lng = parseFloat(coords.lng);
      const formattedLat = (lat >= 0 ? '+' : '-') + String(Math.floor(Math.abs(lat))).padStart(3, '0') + '.' + String(Math.floor((Math.abs(lat) - Math.floor(Math.abs(lat))) * 1000)).padStart(3, '0');
      const formattedLng = (lng >= 0 ? '+' : '-') + String(Math.floor(Math.abs(lng))).padStart(3, '0') + '.' + String(Math.floor((Math.abs(lng) - Math.floor(Math.abs(lng))) * 1000)).padStart(3, '0');
      document.getElementById('coords').innerText = `LAT: ${formattedLat}  LON: ${formattedLng}`;
    }, 50));
  });
}
