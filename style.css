// Mapbox configuration
mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtMGRkbmRrYzBlNzYyaW9oaG5peGY4NTQifQ.aTWb-NcZPgEUm-0b1jib6w';

const map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/mapbox/streets-v11', // Mapbox style
    center: [0, 0], // Longitude, Latitude (initial position)
    zoom: 2 // Initial zoom level
});

// Animate the red crosshair lines to meet at the center of the screen
function animateLinesToCenter() {
    const verticalLine = document.getElementById('vertical-line');
    const horizontalLine = document.getElementById('horizontal-line');

    // Set lines to target the center of the viewport
    verticalLine.style.left = `${window.innerWidth / 2}px`;
    horizontalLine.style.top = `${window.innerHeight / 2}px`;
}

// Trigger the flash effect on click
map.on('click', () => {
    const mapContainer = document.getElementById('map-container');
    mapContainer.classList.add('flash');

    // Remove the flash effect after the animation ends
    setTimeout(() => {
        mapContainer.classList.remove('flash');
    }, 200);
});

// Start the animation as the map initializes
map.on('load', () => {
    animateLinesToCenter();
});

// Recalculate lines on window resize
window.addEventListener('resize', () => {
    animateLinesToCenter();
});
