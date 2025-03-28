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

// Function to fetch data dynamically from both ArcGIS datasets
async function fetchMilitaryBases() {
    const mirtaUrl = 'https://hifld-geoplatform.hub.arcgis.com/datasets/geoplatform::military-installations-ranges-and-training-areas-mirta-dod-sites-boundaries/explore';
    const basesUrl = 'https://hub.arcgis.com/datasets/FDEP::military-bases/data';

    try {
        // Fetch data from MIRTA API
        const mirtaResponse = await fetch(mirtaUrl);
        const mirtaData = await mirtaResponse.json();

        // Fetch data from Military Bases API
        const basesResponse = await fetch(basesUrl);
        const basesData = await basesResponse.json();

        // Combine and normalize data
        const combinedData = [...mirtaData.features, ...basesData.features].map(feature => ({
            name: feature.attributes.Name || 'Unnamed Base',
            lat: feature.geometry.y,
            lon: feature.geometry.x
        }));

        return combinedData;
    } catch (error) {
        console.error('Failed to fetch military base data:', error);
        return []; // Return empty array if API call fails
    }
}

// Function to add flashing markers dynamically
async function displayMilitaryBases() {
    const militaryBases = await fetchMilitaryBases(); // Fetch data dynamically

    // Clear existing markers
    document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());

    // Add markers for updated bases
    militaryBases.forEach(base => {
        const markerElement = document.createElement('div'); // Create a custom marker element
        markerElement.className = 'mapboxgl-marker'; // Assign the flashing effect class

        // Add the marker to the map
        new mapboxgl.Marker(markerElement)
            .setLngLat([base.lon, base.lat])
            .addTo(map);

        // Tooltip for displaying base name and coordinates
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `<strong>${base.name}</strong><br>Lat: ${base.lat}, Lon: ${base.lon}`;
        document.body.appendChild(tooltip);

        // Show tooltip on hover
        markerElement.addEventListener('mouseenter', (event) => {
            tooltip.style.display = 'block';
            tooltip.style.left = `${event.pageX + 10}px`;
            tooltip.style.top = `${event.pageY + 10}px`;
        });

        // Hide tooltip on mouse leave
        markerElement.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    });
}

// Periodic updates to refresh data dynamically
setInterval(displayMilitaryBases, 60000); // Refresh every 60 seconds

// Initial load
displayMilitaryBases();
