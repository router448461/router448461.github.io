// Initialize the Leaflet map
const map = L.map('map-container', {
    zoomControl: false, // Disable zoom buttons
    attributionControl: false, // Remove Leaflet attribution
    dragging: false, // Disable map dragging
    scrollWheelZoom: false, // Disable zooming with the scroll wheel
    doubleClickZoom: false, // Disable zooming with double click
    boxZoom: false, // Disable box zooming
    keyboard: false, // Disable keyboard navigation
    touchZoom: false // Disable pinch zooming on touch devices
}).setView([0, 0], 2); // Set initial view to show the whole world

// Add dark mode tiles without labels using Carto's Positron (no labels) tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">Carto</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// Capital city coordinates
const capitals = [
    { name: "Washington D.C.", lat: 38.9072, lng: -77.0369, population: 702000 },
    { name: "Canberra", lat: -35.2809, lng: 149.1300, population: 395790 },
    { name: "Tokyo", lat: 35.6895, lng: 139.6917, population: 13929286 }
];

// Create blinking dot icon
const createBlinkingDot = (coordinates) => {
    return L.divIcon({
        html: `<div class="blinking-dot" data-coordinates="${coordinates}"></div>`,
        className: '',
        iconSize: [10, 10]
    });
};

// Add blinking markers for each capital and connect them with lines
const markers = [];
capitals.forEach((capital, index) => {
    // Create marker
    const marker = L.marker([capital.lat, capital.lng], {
        icon: createBlinkingDot(`${capital.lat.toFixed(2)}, ${capital.lng.toFixed(2)}`)
    }).on('mouseover', (e) => {
        // Display coordinates and city name in the panel
        const coordinatesPanel = document.getElementById('coordinates-panel');
        coordinatesPanel.textContent = `Coordinates: ${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)} (City: ${capital.name})`;
    }).on('click', (e) => {
        // Move crosshair lines to the clicked city
        const verticalLine = document.getElementById('vertical-line');
        const horizontalLine = document.getElementById('horizontal-line');
        verticalLine.style.left = `${e.containerPoint.x}px`;
        horizontalLine.style.top = `${e.containerPoint.y}px`;
    }).addTo(map);

    markers.push(marker);

    // Draw lines connecting capitals
    if (index > 0) {
        const prevCapital = capitals[index - 1];
        L.polyline(
            [[capital.lat, capital.lng], [prevCapital.lat, prevCapital.lng]],
            { color: 'red', weight: 1 }
        ).addTo(map);
    }
});

// Cluster markers to avoid clutter
const clusterGroup = L.markerClusterGroup();
markers.forEach(marker => clusterGroup.addLayer(marker));
map.addLayer(clusterGroup);

// Function to re-trigger the red line animations
const resetLineAnimations = () => {
    const verticalLine = document.getElementById('vertical-line');
    const horizontalLine = document.getElementById('horizontal-line');

    // Remove and re-add the animation classes to restart them
    verticalLine.style.animation = 'none';
    horizontalLine.style.animation = 'none';

    setTimeout(() => {
        verticalLine.style.animation = 'vertical-draw var(--animation-duration) ease-in-out forwards';
        horizontalLine.style.animation = 'horizontal-draw var(--animation-duration) ease-in-out forwards';
    }, 0);
};

// Trigger animations when the map is ready
map.whenReady(() => {
    resetLineAnimations();
});

// Optimize window resize events using debounce logic
const debounce = (func, delay) => {
    let timeout;
    return () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(), delay);
    };
};

window.addEventListener('resize', debounce(() => {
    resetLineAnimations();
}, 150));

// Live Clock Logic
const updateClock = () => {
    const now = new Date();
    const milliseconds = now.getMilliseconds();
    const nanoseconds = Math.floor(Math.random() * 1000); // Simulated nanoseconds for effect

    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    const timePanel = document.getElementById('time-panel');
    timePanel.textContent = `Time: ${timeString}.${milliseconds.toString().padStart(3, '0')}${nanoseconds.toString().padStart(3, '0')} ns`;
};

// Update the clock every millisecond
setInterval(updateClock, 1);

// Create a bar chart to visualize population data
const createPopulationChart = () => {
    const ctx = document.getElementById('capital-chart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: capitals.map(capital => capital.name),
            datasets: [{
                label: 'Population',
                data: capitals.map(capital => capital.population),
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
                borderColor: 'red',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1000000
                    }
                }
            }
        }
    });
};

// Initialize the population chart
createPopulationChart();
