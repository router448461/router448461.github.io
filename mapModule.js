// mapModule.js
export function initMap(){
  mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-31.83,45.71],
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
    map.flyTo({
      center: [-31.83,45.71],
      zoom: 1.5,
      speed: 0.8,
      curve: 1.42,
      easing: t => t,
      essential: true,
      duration: 3000
    });
    const targetPoints = [
      [-77.0365,38.8977],
      [2.2945,48.8584],
      [-0.1246,51.5007],
      [13.3777,52.5163]
    ];
    const targetOverlay = document.getElementById('target-overlay');
    const markers = [];
    targetPoints.forEach(coordinate => {
      const markerEl = document.createElement('div');
      markerEl.style.width = '24px';
      markerEl.style.height = '24px';
      markerEl.style.backgroundColor = '#FF0000';
      markerEl.style.border = '3px solid #FF0000';
      markerEl.style.borderRadius = '50%';
      markerEl.style.boxShadow = '0 0 10px 3px rgba(255,0,0,0.8)';
      markerEl.classList.add('marker-pulse');
      markerEl.style.position = 'absolute';
      targetOverlay.appendChild(markerEl);
      markers.push({ coordinate, markerEl });
    });
    function updateMarkers(){
      markers.forEach(item => {
        const pos = map.project(item.coordinate);
        if(pos.x < 0 || pos.y < 0 || pos.x > map.getCanvas().width || pos.y > map.getCanvas().height){
          item.markerEl.style.display = 'none';
        } else {
          item.markerEl.style.display = 'block';
          item.markerEl.style.left = (pos.x - 12) + 'px';
          item.markerEl.style.top = (pos.y - 12) + 'px';
        }
      });
    }
    map.on('render', updateMarkers);
    const mapContainer = map.getContainer();
    mapContainer.addEventListener('mousemove', throttle(function(e){
      const rect = mapContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const coords = map.unproject([mouseX, mouseY]);
      const lat = parseFloat(coords.lat);
      const lng = parseFloat(coords.lng);
      const formattedLat = (lat >= 0 ? '+' : '-') + String(Math.floor(Math.abs(lat))).padStart(3,'0') + '.' + String(Math.floor((Math.abs(lat) - Math.floor(Math.abs(lat)))*1000)).padStart(3,'0');
      const formattedLng = (lng >= 0 ? '+' : '-') + String(Math.floor(Math.abs(lng))).padStart(3,'0') + '.' + String(Math.floor((Math.abs(lng) - Math.floor(Math.abs(lng)))*1000)).padStart(3,'0');
      document.getElementById('coords').innerText = `LAT: ${formattedLat}  LON: ${formattedLng}`;
    }, 50));
    window.theMap = map;
  });
}
function throttle(func, limit){
  let lastCall = 0;
  return function(...args){
    const now = Date.now();
    if(now - lastCall >= limit){
      lastCall = now;
      func.apply(this, args);
    }
  }
}
