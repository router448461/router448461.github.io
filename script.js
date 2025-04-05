mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 1.5,
  interactive: false
});

map.on('load', () => {
  const mapContainer = map.getContainer();
  let lockOnTimeout;

  mapContainer.addEventListener('mousemove', (e) => {
    const rect = mapContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const coords = map.unproject([mouseX, mouseY]);
    const lat = Math.max(-90, Math.min(90, coords.lat.toFixed(3)));
    const lng = coords.lng.toFixed(3);
    document.getElementById('target-coords').innerText = `TARGET: ${lat}, ${lng}`;

    clearTimeout(lockOnTimeout);
    lockOnTimeout = setTimeout(() => {
      document.getElementById('reticle').style.borderColor = '#FF0000';
    }, 2000);
  });

  mapContainer.addEventListener('mouseleave', () => {
    clearTimeout(lockOnTimeout);
    document.getElementById('reticle').style.borderColor = 'var(--military-red)';
  });
});

document.addEventListener('mousemove', (e) => {
  const reticle = document.getElementById('reticle');
  reticle.style.left = `${e.clientX}px`;
  reticle.style.top = `${e.clientY}px`;
});

document.addEventListener('click', () => {
  const map = document.getElementById('map');
  const glitchOverlay = document.getElementById('glitch-overlay');

  glitchOverlay.classList.add('glitch');
  setTimeout(() => {
    glitchOverlay.classList.remove('glitch');
  }, 100);

  map.style.transition = 'transform 0.1s';
  map.style.transform = 'translate(-50%, -50%) rotate(0.5deg)';
  setTimeout(() => {
    map.style.transform = 'translate(-50%, -50%) rotate(-0.5deg)';
    setTimeout(() => {
      map.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    }, 100);
  }, 100);
});
