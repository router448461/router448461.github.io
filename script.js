mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable all user interactions
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
    // Flash overlay for 100ms.
    const flashEl = document.getElementById('flash-overlay');
    flashEl.classList.add('flash');
    setTimeout(() => {
      flashEl.classList.remove('flash');
      // Unpause all line animations.
      document.querySelectorAll('.line').forEach(el => {
        el.style.animationPlayState = 'running';
      });
    }, 100);

    // Wait until the drawing completes (2.015 seconds) then trigger triangle blinking.
    setTimeout(() => {
      blinkTriangles(() => {
        // After blinking, show the clock.
        document.getElementById('clock').style.display = 'block';
        startClock();
      });
    }, 2015);
    
  }, 4000);
});

function startClock() {
  updateClock();
  setInterval(updateClock, 50);
}

function updateClock() {
  const clockEl = document.getElementById('clock');
  const now = new Date();
  // Format time as HH:MM:SS:ms (military style, with leading zeros)
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  clockEl.textContent = `${hours}:${minutes}:${seconds}:${milliseconds}`;
}

function blinkTriangles(callback) {
  const triangles = document.querySelectorAll('.line.triangle');
  let blinkCount = 0;
  
  function doBlink() {
    // Hide triangle lines.
    triangles.forEach(el => (el.style.opacity = '0'));
    setTimeout(() => {
      // Show triangle lines.
      triangles.forEach(el => (el.style.opacity = '1'));
      blinkCount++;
      if (blinkCount < 3) {
        setTimeout(doBlink, 1000);
      } else {
        // After three blinks, wait one final second then call the callback.
        setTimeout(callback, 1000);
      }
    }, 100);
  }
  
  doBlink();
}
