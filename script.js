// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtMGRkbmRrYzBlNzYyaW9oaG5peGY4NTQifQ.aTWb-NcZPgEUm-0b1jib6w';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map', // ID of the map container
  style: 'mapbox://styles/mapbox/light-v11', // Mapbox style
  center: [0, 0], // Longitude and latitude of map center
  zoom: 2, // Initial zoom level
  projection: 'mercator' // Flat world map projection
});
