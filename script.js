mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/night-v1',
  center: [0, 0],
  zoom: 1.5,
  attributionControl: false
});
map.dragPan.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.touchZoomRotate.disable();

const reticle = document.getElementById('reticle');
const targetCoords = document.getElementById('target-coords');

map.on('load', () => {
  let circleGeoJSON = createGeoJSONCircle([0, 0], 9656, 64);
  map.addSource('blast-radius', { type: 'geojson', data: circleGeoJSON });
  map.addLayer({
    id: 'blast-radius-layer',
    type: 'fill',
    source: 'blast-radius',
    paint: { 'fill-color': '#006699', 'fill-opacity': 0.2 }
  });
  let start = performance.now();
  function animateBlast() {
    let now = performance.now();
    let t = ((now - start) % 2000) / 2000 * 2 * Math.PI;
    let opacity = 0.2 + 0.05 * Math.sin(t);
    map.setPaintProperty('blast-radius-layer', 'fill-opacity', opacity);
    requestAnimationFrame(animateBlast);
  }
  animateBlast();
});

function createGeoJSONCircle(center, radiusInMeters, points) {
  const coords = { latitude: center[1], longitude: center[0] };
  const km = radiusInMeters / 1000;
  const ret = [];
  const distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
  const distanceY = km / 110.574;
  for (let i = 0; i < points; i++) {
    let theta = (i / points) * (2 * Math.PI);
    let x = distanceX * Math.cos(theta);
    let y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ret] } };
}

function formatCoord(num) {
  return num.toFixed(3).padStart(7, ' ');
}

function updateCoordinates(e) {
  const rect = map.getContainer().getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const coords = map.unproject([mouseX, mouseY]);
  const formattedLat = formatCoord(coords.lat);
  const formattedLng = formatCoord(coords.lng);
  targetCoords.innerText = `TARGET: LAT ${formattedLat}, LON ${formattedLng}`;
  reticle.style.left = `${e.clientX}px`;
  reticle.style.top = `${e.clientY}px`;
  let circleGeoJSON = createGeoJSONCircle([coords.lng, coords.lat], 9656, 64);
  if (map.getSource('blast-radius')) map.getSource('blast-radius').setData(circleGeoJSON);
}

document.addEventListener('mousemove', updateCoordinates);
