mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false,
});

// Disable interactive gestures.
map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

// Hide unwanted map elements (such as labels and titles) as soon as possible.
function hideMapElements() {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  style.layers.forEach((layer) => {
    if (layer.type === 'symbol') {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });
}
map.on('styledata', hideMapElements);

map.on('load', () => {
  // Delay the start of overlay animations by 1 second.
  setTimeout(() => {
    // Start red lines animations.
    document.querySelectorAll('.line').forEach((el) => {
      el.style.animationPlayState = 'running';
    });
    // Start triangle animation.
    document.querySelectorAll('#triangle polygon').forEach((el) => {
      el.style.animationPlayState = 'running';
    });
  }, 1000);
});
