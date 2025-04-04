mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0], // Centered to the world
  zoom: 1.5,
  attributionControl: false,
});

map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

function hideMapElements() {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach(layer => {
    if (
      layer.type === 'symbol' ||
      (layer.id && (layer.id.includes('boundary') ||
                    layer.id.includes('admin-0') ||
                    layer.id.includes('admin-1')))
    ) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
}

const clockElement = document.getElementById('clock');

function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const centiseconds = Math.floor(now.getMilliseconds() / 10)
    .toString()
    .padStart(2, '0');
  clockElement.innerText = `${hours}:${minutes}:${seconds}:${centiseconds}`;
}

map.on('load', () => {
  hideMapElements();

  document.getElementById('map').style.visibility = 'visible';

  console.log('Map loaded; unwanted elements hidden.');

  setInterval(updateClock, 10);
});

map.on('styledata', hideMapElements);
