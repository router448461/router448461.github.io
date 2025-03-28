import { fetchMilitaryBases } from './data.js';

mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHNobXZoMjAwNzIya29jOHByNDBucHgifQ.LsGEX5K-EQLu10oo1U_Enw';

const map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [133.7751, -25.2744], // Center of Australia
    zoom: 4,
    attributionControl: false // Removes Mapbox attribution
});

// Animate crosshair lines
function animateLinesToCenter() {
    const verticalLine = document.getElementById('vertical-line');
    const horizontalLine = document.getElementById('horizontal-line');
    verticalLine.style.left = `${window.innerWidth / 2}px`;
    horizontalLine.style.top = `${window.innerHeight / 2}px`;
}
window.addEventListener('resize', animateLinesToCenter);
animateLinesToCenter();

// Add GeoJSON-based military bases to the map
async function displayMilitaryBases() {
    const geojsonData = await fetchMilitaryBases();
    console.log('GeoJSON Data:', geojsonData); // Debugging output

    // Remove existing source if already present
    if (map.getSource('military-bases')) {
        map.getSource('military-bases').setData(geojsonData);
    } else {
        // Add a new source and layer
        map.addSource('military-bases', { type: 'geojson', data: geojsonData });
        map.addLayer({
            id: 'military-bases-layer',
            type: 'circle',
            source: 'military-bases',
            paint: {
                'circle-radius': 6,
                'circle-color': 'red',
                'circle-opacity': 1,
                'circle-stroke-width': 2,
                'circle-stroke-color': 'white'
            }
        });

        // Add flashing animation
        let flashToggle = true;
        setInterval(() => {
            map.setPaintProperty(
                'military-bases-layer',
                'circle-opacity',
                flashToggle ? 1 : 0.5
            );
            flashToggle = !flashToggle;
        }, 500);
    }

    // Tooltip popups
    map.on('mouseenter', 'military-bases-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const name = e.features[0].properties.name;

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`<strong>${name}</strong>`)
            .addTo(map);
    });
}

// Wait for the map to load
map.on('load', () => {
    displayMilitaryBases();
});
