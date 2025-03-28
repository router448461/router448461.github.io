mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtMGRkbmRrYzBlNzYyaW9oaG5peGY4NTQifQ.aTWb-NcZPgEUm-0b1jib6w';

const map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [133.7751, -25.2744], // Center of Australia
    zoom: 4,
    attributionControl: false // Removes Mapbox attribution
});

// Function to animate lines to the center of the viewport
function animateLinesToCenter() {
    const verticalLine = document.getElementById('vertical-line');
    const horizontalLine = document.getElementById('horizontal-line');

    // Set lines to target the center of the viewport
    verticalLine.style.left = `${window.innerWidth / 2}px`;
    horizontalLine.style.top = `${window.innerHeight / 2}px`;
}

// Recalculate crosshair lines on window resize
window.addEventListener('resize', () => {
    animateLinesToCenter();
});

// Call the function initially to set the crosshair lines
animateLinesToCenter();

// Function to fetch military bases data
async function fetchMilitaryBases() {
    const mirtaUrl =
        'https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Military_Installations_Ranges_and_Training_Areas_MIRTA_DOD_Sites_Boundaries/FeatureServer/0/query?where=1%3D1&outFields=Name,Latitude,Longitude&outSR=4326&f=json';
    const basesUrl =
        'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/MilitaryBases/FeatureServer/0/query?where=1%3D1&outFields=Name,Latitude,Longitude&outSR=4326&f=json';

    try {
        const mirtaResponse = await fetch(mirtaUrl);
        const mirtaData = await mirtaResponse.json();

        const basesResponse = await fetch(basesUrl);
        const basesData = await basesResponse.json();

        // Combine and format data as GeoJSON
        const features = [
            ...mirtaData.features.map(feature => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [feature.geometry.x, feature.geometry.y] },
                properties: { name: feature.attributes.Name || 'Unnamed Base' }
            })),
            ...basesData.features.map(feature => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [feature.geometry.x, feature.geometry.y] },
                properties: { name: feature.attributes.Name || 'Unnamed Base' }
            }))
        ];

        return {
            type: 'FeatureCollection',
            features: features
        }; // Return GeoJSON
    } catch (error) {
        console.error('Failed to fetch military base data:', error);
        return { type: 'FeatureCollection', features: [] }; // Return empty GeoJSON if an error occurs
    }
}

// Function to display bases using GeoJSON and a Mapbox layer
async function displayMilitaryBases() {
    const geojsonData = await fetchMilitaryBases(); // Fetch GeoJSON data

    // Add a GeoJSON source for military bases
    map.addSource('military-bases', {
        type: 'geojson',
        data: geojsonData
    });

    // Add a layer to display the bases as flashing red dots
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

    // Animate flashing effect (use transition opacity to simulate)
    let flashToggle = true;
    setInterval(() => {
        map.setPaintProperty(
            'military-bases-layer',
            'circle-opacity',
            flashToggle ? 1 : 0.5
        );
        flashToggle = !flashToggle;
    }, 500); // Toggle every 500ms

    // Add popup tooltips on hover
    map.on('mouseenter', 'military-bases-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const name = e.features[0].properties.name;

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`<strong>${name}</strong>`)
            .addTo(map);
    });
}

// Wait for the map to load before adding layers
map.on('load', () => {
    displayMilitaryBases();
});
