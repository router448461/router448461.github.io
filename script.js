mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable map interactions
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// A JavaScript glitch effect applied to a given element using random transforms
function applyGlitchEffect(element, intensity = 2) {
  function glitch() {
    const dx = (Math.random() * intensity * 2) - intensity;
    const dy = (Math.random() * intensity * 2) - intensity;
    const skew = (Math.random() * intensity * 0.2) - (intensity * 0.1);
    element.style.transform = `translate(${dx}px, ${dy}px) skew(${skew}deg)`;
    setTimeout(glitch, Math.random() * 200 + 50);
  }
  glitch();
}

map.on('load', () => {
  const lens = document.getElementById('lens-effect');
  if (lens) {
    applyGlitchEffect(lens, 2);
  }
});
