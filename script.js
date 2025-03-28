// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtMGRkbmRrYzBlNzYyaW9oaG5peGY4NTQifQ.aTWb-NcZPgEUm-0b1jib6w';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11', // Light base map style
  center: [0, 0], // Center of the world
  zoom: 2,
  projection: 'mercator' // Flat world map
});

// Ensure layers are loaded before making changes
map.on('load', () => {
  // Remove all labels from the map
  map.getStyle().layers.forEach(layer => {
    if (layer.type === 'symbol') {
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    }
  });

  // Add flashing markers at Australian military bases
  const militaryBases = [
    { name: "Base A", coordinates: [149.165, -35.308] }, // Canberra
    { name: "Base B", coordinates: [130.841, -12.425] }, // Darwin
    { name: "Base C", coordinates: [117.165, -20.667] }  // Pilbara
  ];

  militaryBases.forEach(base => {
    const markerElement = document.createElement('div');
    markerElement.className = 'blink';
    markerElement.style.width = '12px';
    markerElement.style.height = '12px';
    markerElement.style.backgroundColor = 'red';
    markerElement.style.borderRadius = '50%';

    new mapboxgl.Marker(markerElement).setLngLat(base.coordinates).addTo(map);
  });
});

// Add red lines converging in the middle
const lineTop = document.createElement('div');
lineTop.id = 'line-top';
lineTop.className = 'red-line';
document.body.appendChild(lineTop);

const lineBottom = document.createElement('div');
lineBottom.id = 'line-bottom';
lineBottom.className = 'red-line';
document.body.appendChild(lineBottom);

const lineLeft = document.createElement('div');
lineLeft.id = 'line-left';
lineLeft.className = 'red-line';
document.body.appendChild(lineLeft);

const lineRight = document.createElement('div');
lineRight.id = 'line-right';
lineRight.className = 'red-line';
document.body.appendChild(lineRight);
