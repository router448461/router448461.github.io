mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [133.7751, -25.2744],
  zoom: 4,
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

const australianMilitaryBases = [
  { name: "RAAF Base Edinburgh", coordinates: [138.62, -34.93] },
  { name: "HMAS Stirling", coordinates: [115.79, -32.02] },
  { name: "HMAS Albatross", coordinates: [151.16, -33.96] },
  { name: "RAAF Base Darwin", coordinates: [130.85, -12.42] },
  { name: "RAAF Base Richmond", coordinates: [150.91, -33.62] },
  { name: "RAAF Base Amberley", coordinates: [152.71, -27.63] },
  { name: "HMAS Coonawarra", coordinates: [130.84, -12.46] },
  { name: "Lavarack Barracks", coordinates: [146.77, -19.31] },
];

function addMilitaryBasesMarkers() {
  australianMilitaryBases.forEach(base => {
    new mapboxgl.Marker({ color: "green" })
      .setLngLat(base.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(base.name))
      .addTo(map);
  });
}

const clockElement = document.getElementById('clock');
const countdownElement = document.getElementById('countdown');
const cmdTextElement = document.getElementById('cmd-text');
let countdownTime = 60 * 1000;
let syncInterval;

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

function updateCountdown() {
  countdownTime -= 10;
  if (countdownTime < 0) countdownTime = 0;

  const minutes = Math.floor((countdownTime % (1000 * 60 * 60)) / (1000 * 60))
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((countdownTime % (1000 * 60)) / 1000)
    .toString()
    .padStart(2, '0');
  const centiseconds = Math.floor((countdownTime % 1000) / 10)
    .toString()
    .padStart(2, '0');
  countdownElement.innerText = `${minutes}:${seconds}:${centiseconds}`;
  cmdTextElement.innerText = "CMD + R";
}

function syncTimers() {
  updateClock();
  updateCountdown();
}

map.on('load', () => {
  hideMapElements();

  document.getElementById('map').style.visibility = 'visible';

  addMilitaryBasesMarkers();

  console.log('Map loaded; unwanted elements hidden; markers added.');

  setTimeout(() => {
    countdownTime = 60 * 1000;
    syncInterval = setInterval(syncTimers, 10);
  }, 3000);
});

map.on('styledata', hideMapElements);
