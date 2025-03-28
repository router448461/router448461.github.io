// Initialize the Leaflet map
const map = L.map('map-container', {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: false
}).setView([-35.2809, 149.1300], 2); // Center on Canberra

// Add dark mode tiles without labels using Carto's Positron (no labels) tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">Carto</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

// Capital city coordinates
const capitals = [
    { name: "Washington D.C.", lat: 38.9072, lng: -77.0369 },
    { name: "Ottawa", lat: 45.4215, lng: -75.6972 },
    { name: "London", lat: 51.5074, lng: -0.1278 },
    { name: "Paris", lat: 48.8566, lng: 2.3522 },
    { name: "Berlin", lat: 52.52, lng: 13.405 },
    { name: "Rome", lat: 41.9028, lng: 12.4964 },
    { name: "Madrid", lat: 40.4168, lng: -3.7038 },
    { name: "Lisbon", lat: 38.7169, lng: -9.1399 },
    { name: "Amsterdam", lat: 52.3676, lng: 4.9041 },
    { name: "Brussels", lat: 50.8503, lng: 4.3517 },
    { name: "Luxembourg City", lat: 49.6117, lng: 6.1319 },
    { name: "Copenhagen", lat: 55.6761, lng: 12.5683 },
    { name: "Oslo", lat: 59.9139, lng: 10.7522 },
    { name: "Reykjavik", lat: 64.1355, lng: -21.8954 },
    { name: "Ankara", lat: 39.9208, lng: 32.8541 },
    { name: "Athens", lat: 37.9838, lng: 23.7275 },
    { name: "Canberra", lat: -35.2809, lng: 149.1300 },
    { name: "Wellington", lat: -41.2865, lng: 174.7762 },
    { name: "Tokyo", lat: 35.6895, lng: 139.6917 },
    { name: "Seoul", lat: 37.5665, lng: 126.9780 },
    { name: "Jerusalem", lat: 31.7683, lng: 35.2137 },
    { name: "Stockholm", lat: 59.3293, lng: 18.0686 },
    { name: "Helsinki", lat: 60.1695, lng: 24.9354 },
    { name: "Vienna", lat: 48.2082, lng: 16.3738 },
    { name: "Dublin", lat: 53.3498, lng: -6.2603 }
];

// Haversine formula to calculate the distance between two points (in kilometers)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in kilometers

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

// Sort capitals by distance from Canberra
const sortedCapitals = capitals
    .map((capital) => ({
        ...capital,
        distance: calculateDistance(-35.2809, 149.1300, capital.lat, capital.lng)
    }))
    .sort((a, b) => a.distance - b.distance);

// Create blinking dot icon
const createBlinkingDot = (coordinates) => {
    return L.divIcon({
        html: `<div class="blinking-dot" data-coordinates="${coordinates}"></div>`,
        className: '',
        iconSize: [10, 10]
    });
};

// Add blinking markers for each capital
sortedCapitals.forEach((capital) => {
    L.marker([capital.lat, capital.lng], {
        icon: createBlinkingDot(`${capital.lat.toFixed(2)}, ${capital.lng.toFixed(2)}`)
    }).on('mouseover', (e) => {
        // Display coordinates and city name in the panel
        const coordinatesPanel = document.getElementById('coordinates-panel');
        coordinatesPanel.textContent = `Coordinates: ${e.latlng.lat.toFixed(2)}, ${e.latlng.lng.toFixed(2)} (City: ${capital.name})`;
    }).addTo(map);
});

// Function to animate a line from Canberra to the closest city
const animateLine = () => {
    const canberra = { lat: -35.2809, lng: 149.1300 }; // Canberra
    const closestCity = sortedCapitals[1]; // Closest city, excluding Canberra itself

    const line = L.polyline([ [canberra.lat, canberra.lng] ], { color: 'red', weight: 3 }).addTo(map);

    const latDiff = (closestCity.lat - canberra.lat) / 300; // Divide by 300 for 30 seconds
    const lngDiff = (closestCity.lng - canberra.lng) / 300;

    let step = 0;

    const interval = setInterval(() => {
        if (step >= 300) {
            clearInterval(interval);
        } else {
            const newLat = canberra.lat + latDiff * step;
            const newLng = canberra.lng + lngDiff * step;
            line.addLatLng([newLat, newLng]);
            step++;
        }
    }, 100); // Update every 100ms (300 steps = 30 seconds)
};

// Trigger animations when the map is ready
map.whenReady(() => {
    animateLine(); // Start the line animation
});

// Live Clock Logic
document.addEventListener('DOMContentLoaded', () => {
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
});
