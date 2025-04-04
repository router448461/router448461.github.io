// Set access token and create the Mapbox map.
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

// A helper function to remove undesired map elements.
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

  // After an initial 4-second wait...
  setTimeout(() => {
    // Flash for 1 millisecond.
    const flashEl = document.getElementById('flash-overlay');
    flashEl.classList.add('flash');
    setTimeout(() => {
      flashEl.classList.remove('flash');
      // Unpause all cross-line animations.
      document.querySelectorAll('.line').forEach((el) => {
        el.style.animationPlayState = 'running';
      });
    }, 1);

    // After the drawing animation completes (2.015 seconds), blink the lines.
    setTimeout(() => {
      blinkCrossLines(() => {
        // Once blinking is complete, display and start the stopwatch.
        document.getElementById('clock').style.display = 'block';
        startStopwatch();
      });
    }, 2015);
  }, 4000);
});

// Blink the cross lines (both horizontal and vertical) 3 times at 3ms intervals.
function blinkCrossLines(callback) {
  const lines = document.querySelectorAll('.line.horizontal, .line.vertical');
  let blinkCount = 0;
  
  function doBlink() {
    lines.forEach((el) => (el.style.opacity = '0'));
    setTimeout(() => {
      lines.forEach((el) => (el.style.opacity = '1'));
      blinkCount++;
      if (blinkCount < 3) {
        setTimeout(doBlink, 3);
      } else {
        // After final blink, call the callback.
        callback();
      }
    }, 3);
  }
  
  doBlink();
}

// Stopwatch functionality: counts upward from 00:00:000.
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
