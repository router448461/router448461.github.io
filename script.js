mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtMGRkbmRrYzBlNzYyaW9oaG5peGY4NTQifQ.aTWb-NcZPgEUm-0b1jib6w';

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

// Fetch GeoJSON data for military bases
async function fetchMilitaryBases() {
    try {
        const response1 = await fetch('https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Military_Installations_Ranges_and_Training_Areas_MIRTA_DOD_Sites_Boundaries/FeatureServer/0/query?where=1%3D1&outFields=Name,Latitude,Longitude&outSR=4326&f=json');
        const data1 = await response1.json();

        const response2 = await fetch('https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/MilitaryBases/FeatureServer/0/query?where=1%3D1&outFields=Name,Latitude,Longitude&outSR=4326&f=json');
        const data2 = await response2.json();

        const features = [
            ...data1.features.map(feature => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [feature.geometry.x, feature.geometry.y] },
                properties: { name: feature.attributes.Name || 'Unnamed Base' }
            })),
            ...data2.features.map(feature => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [feature.geometry.x, feature.geometry.y] },
                properties: { name: feature.attributes.Name || 'Unnamed Base' }
            }))
        ];

        return { type: 'FeatureCollection', features };
    } catch (error) {
        console.error('Failed to fetch military base data:', error);
        return { type: 'FeatureCollection', features: [] }; // Empty GeoJSON
    }
}

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
