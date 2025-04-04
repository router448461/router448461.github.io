mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable all interactive gestures
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
  style.layers.forEach((layer) => {
    if (
      layer.type === 'symbol' ||
      (layer.id &&
        (layer.id.includes('boundary') ||
         layer.id.includes('admin-0') ||
         layer.id.includes('admin-1')))
    ) {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
}

// Add a day-night overlay based on the visitor's location using SunCalc.
function addDayNightOverlay(map) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const sunPos = SunCalc.getPosition(new Date(), latitude, longitude);
        // If the sun's altitude is greater than 0, it's day; otherwise, it's night.
        const isDay = sunPos.altitude > 0;
        const gradient = isDay
          ? 'linear-gradient(to bottom, rgba(255, 255, 0, 0.2), rgba(255, 255, 0, 0))'
          : 'linear-gradient(to bottom, rgba(0, 0, 139, 0.3), rgba(0, 0, 139, 0))';

        const overlay = document.createElement('div');
        overlay.id = 'dayNightOverlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.pointerEvents = 'none';
        // Ensure the day/night overlay sits beneath the animated lines but above the map.
        overlay.style.zIndex = '5';
        overlay.style.background = gradient;

        document.body.appendChild(overlay);
      },
      (err) => {
        console.error("Error fetching geolocation:", err);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}

map.on('load', () => {
  hideMapElements();

  // Make the map visible immediately
  document.getElementById('map').style.visibility = 'visible';

  // Start the line animations immediately
  document.querySelectorAll('.line').forEach((el) => {
    el.style.animationPlayState = 'running';
  });

  // Play background audio instantly
  const audioBg = document.getElementById('audio-bg');
  if (audioBg) {
    audioBg.play().catch((e) =>
      console.log("Background audio play was prevented:", e)
    );
  }

  // Play alert audio without delay
  const audioAlert = document.getElementById('audio-alert');
  if (audioAlert) {
    audioAlert.play().catch((e) =>
      console.log("Alert audio play was prevented:", e)
    );
  }

  // Add the day–night overlay based on visitor location.
  addDayNightOverlay(map);
});
