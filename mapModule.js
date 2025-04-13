// mapModule.js
export function initMap(){
  mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';
  const initialZoom = 0.8;
  const targetZoom = 1.5;
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [0,0],
    zoom: initialZoom,
    attributionControl: false
  });
  map.dragPan.disable();
  map.dragRotate.disable();
  map.scrollZoom.disable();
  map.doubleClickZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  map.touchZoomRotate.disable();
  map.on('load', ()=>{
    map.flyTo({
      center: [0,0],
      zoom: targetZoom,
      speed: 0.8,
      curve: 1.42,
      easing: t=>t,
      essential: true,
      duration: 2500
    });
    addTargetMarker(map, [-77.0365,38.8977]);
    addTargetMarker(map, [2.2945,48.8584]);
    addTargetMarker(map, [-0.1246,51.5007]);
    addTargetMarker(map, [13.3777,52.5163]);
    const mapContainer = map.getContainer();
    mapContainer.addEventListener('mousemove', throttle(function(e){
      const rect = mapContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const coords = map.unproject([mouseX, mouseY]);
      const lat = parseFloat(coords.lat);
      const lng = parseFloat(coords.lng);
      const formattedLat = (lat>=0?'+':'-')+String(Math.floor(Math.abs(lat))).padStart(3,'0')+'.'+String(Math.floor((Math.abs(lat)-Math.floor(Math.abs(lat)))*1000)).padStart(3,'0');
      const formattedLng = (lng>=0?'+':'-')+String(Math.floor(Math.abs(lng))).padStart(3,'0')+'.'+String(Math.floor((Math.abs(lng)-Math.floor(Math.abs(lng)))*1000)).padStart(3,'0');
      document.getElementById('coords').innerText = `LAT: ${formattedLat}  LON: ${formattedLng}`;
    },50));
  });
}
function addTargetMarker(map, coordinates){
  const markerEl = document.createElement('div');
  markerEl.style.width = '12px';
  markerEl.style.height = '12px';
  markerEl.style.backgroundColor = '#fff';
  markerEl.style.border = '2px solid #FF0000';
  markerEl.style.borderRadius = '50%';
  markerEl.style.boxShadow = '0 0 8px 2px rgba(255,0,0,0.7)';
  markerEl.classList.add('marker-pulse');
  new mapboxgl.Marker({ element: markerEl })
    .setLngLat(coordinates)
    .addTo(map);
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
