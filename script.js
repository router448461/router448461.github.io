// Mapbox configuration with default public token
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtMGRkbmRrYzBlNzYyaW9oaG5peGY4NTQifQ.aTWb-NcZPgEUm-0b1jib6w';

const map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/streets-v11', // Mapbox style
    center: [0, 0], // Longitude, Latitude (initial position)
    zoom: 2 // Initial zoom level
});

// Adjust the red crosshair lines on window resize
window.addEventListener('resize', () => {
    adjustCrosshairs();
});

function adjustCrosshairs() {
    const verticalLine = document.getElementById('vertical-line');
    const horizontalLine = document.getElementById('horizontal-line');

    verticalLine.style.left = `${window.innerWidth / 2}px`;
    horizontalLine.style.top = `${window.innerHeight / 2}px`;
}

// Trigger a flash effect when clicking the map
map.on('click', () => {
    const mapContainer = document.getElementById('map-container');
    mapContainer.classList.add('flash');

    // Remove the flash effect after the animation ends
    setTimeout(() => {
        mapContainer.classList.remove('flash');
    }, 200);
});

// Initialize crosshair alignment
adjustCrosshairs();
