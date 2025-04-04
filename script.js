mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false
});
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();
function applyGlitchEffect(element, intensity) {
  intensity = intensity || 2;
  function glitch() {
    const dx = (Math.random() * intensity * 2) - intensity;
    const dy = (Math.random() * intensity * 2) - intensity;
    const skew = (Math.random() * intensity * 0.2) - (intensity * 0.1);
    element.style.transform = `translate(${dx}px, ${dy}px) skew(${skew}deg)`;
    setTimeout(glitch, Math.random() * 200 + 50);
  }
  glitch();
}
function applyGlitchToLines() {
  const lines = document.querySelectorAll('.line');
  lines.forEach(line => {
    applyGlitchEffect(line, 1.5);
  });
}
map.on('load', function() {
  const lens = document.getElementById('lens-effect');
  if (lens) {
    applyGlitchEffect(lens, 2);
  }
  applyGlitchToLines();
});
