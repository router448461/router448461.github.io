mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtMGRkbmRrYzBlNzYyaW9oaG5peGY4NTQifQ.aTWb-NcZPgEUm-0b1jib6w';

const map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [133.7751, -25.2744], // Center of Australia
    zoom: 4,
    attributionControl: false // Removes attribution link
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

// Function to fetch and update data dynamically
async function updateMilitaryBases() {
    try {
        // Example endpoint for fetching dynamic data
        const response = await fetch('https://example.com/api/military-bases'); // Replace with actual API endpoint
        const updatedData = await response.json();

        // Clear existing markers
        document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());

        // Add updated markers
        updatedData.forEach(base => {
            const marker = new mapboxgl.Marker({ color: 'red' })
                .setLngLat([base.lon, base.lat])
                .addTo(map);

            // Tooltip for displaying base name and coordinates
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = `<strong>${base.name}</strong><br>Lat: ${base.lat}, Lon: ${base.lon}`;
            document.body.appendChild(tooltip);

            // Show tooltip on hover
            marker.getElement().addEventListener('mouseenter', (event) => {
                tooltip.style.display = 'block';
                tooltip.style.left = `${event.pageX + 10}px`;
                tooltip.style.top = `${event.pageY + 10}px`;
            });

            // Hide tooltip on mouse leave
            marker.getElement().addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        });
    } catch (error) {
        console.error('Failed to fetch military base data:', error);
    }
}

// Periodically update markers every 60 seconds
setInterval(updateMilitaryBases, 60000);

// Initial call to populate the map
updateMilitaryBases();
