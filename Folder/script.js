mapboxgl.accessToken = 'YOUR_ACCESS_TOKEN'; // Replace with your Mapbox access token
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [134.35, -25.61], // Center on Australia
    zoom: 4,
    interactive: false // Disable all interactions
});

map.on('load', function() {
    var layers = map.getStyle().layers;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            map.setLayoutProperty(layers[i].id, 'visibility', 'none');
        }
    }
});
