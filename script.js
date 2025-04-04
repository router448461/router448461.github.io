mapboxgl.accessToken =
  'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
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


  document.querySelectorAll('.line').forEach((el) => {
    el.style.animationPlayState = 'running';
  });


  const audioBg = document.getElementById('audio-bg');
  if (audioBg) {
    audioBg.play().catch((e) =>
      console.log("Background audio play was prevented:", e)
    );
  }

  
  setTimeout(() => {
    const audioAlert = document.getElementById('audio-alert');
    if (audioAlert) {
      audioAlert.play().catch((e) =>
        console.log("Alert audio play was prevented:", e)
      );
    }
  }, 9000);
});
