// Mapbox access token and map initialization.
mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable all user interactions.
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Hide undesired map labels and boundaries.
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

map.on('load', () => {
  hideMapElements();
  document.getElementById('map').style.visibility = 'visible';

  // Wait 4 seconds before starting the sequence.
  setTimeout(() => {
    // Flash the entire screen white for 1 millisecond.
    const flashEl = document.getElementById('flash-overlay');
    flashEl.classList.add('flash');
    setTimeout(() => {
      flashEl.classList.remove('flash');
      // Unpause all cross-line animations to start drawing.
      document.querySelectorAll('.line').forEach((el) => {
        el.style.animationPlayState = 'running';
      });
    }, 1);

    // After the drawing animation completes (2.015 seconds), start the flicker.
    setTimeout(() => {
      blinkCrossLines(() => {
        // When blinking is finished, show and start the stopwatch clock.
        document.getElementById('clock').style.display = 'block';
        startStopwatch();
      });
    }, 2015);
  }, 4000);
});

// Blink (flicker) the four cross lines three times
// The sequence will toggle opacity (on/off) six times (3 cycles)
// with each toggle occurring after 3ms.
function blinkCrossLines(callback) {
  const lines = document.querySelectorAll('.line.horizontal, .line.vertical');
  let toggleCount = 0;

  function toggleBlink() {
    if (toggleCount >= 6) {
      // Ensure the final state is "on" (opacity = 1) and call the callback.
      lines.forEach((el) => (el.style.opacity = '1'));
      callback();
    } else {
      lines.forEach((el) => {
        const current = window.getComputedStyle(el).opacity;
        el.style.opacity = current === '1' ? '0' : '1';
      });
      toggleCount++;
      setTimeout(toggleBlink, 3);
    }
  }

  toggleBlink();
}

// Stopwatch functionality.
let stopwatchStart = null;
function startStopwatch() {
  stopwatchStart = Date.now();
  updateStopwatch();
  setInterval(updateStopwatch, 50);
}

function updateStopwatch() {
  const clockEl = document.getElementById('clock');
  const elapsed = Date.now() - stopwatchStart;
  const minutes = Math.floor(elapsed / 60000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((elapsed % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  const milliseconds = (elapsed % 1000).toString().padStart(3, '0');
  clockEl.textContent = `${minutes}:${seconds}:${milliseconds}`;
}
