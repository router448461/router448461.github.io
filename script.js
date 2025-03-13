// Initialize the map
const map = L.map('map', {
    maxBounds: [
        [-45, 110],  // Southwest corner (approximate boundary for Australia)
        [-9, 155]    // Northeast corner (approximate boundary for Australia)
    ],
    maxBoundsViscosity: 1.0, // Prevent panning out of bounds
    zoomSnap: 0.5,          // Adjust zoom snapping for smoothness
}).setView([-25.2744, 133.7751], 4); // Center on Australia

// Add a dark tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 7, // Prevent zooming in too far
    minZoom: 4  // Prevent zooming out beyond Australia
}).addTo(map);

// Add server markers
const serverLocations = [
    { lat: -33.8688, lng: 151.2093, name: "Sydney Server" },
    { lat: -37.8136, lng: 144.9631, name: "Melbourne Server" }
];

serverLocations.forEach(server => {
    L.marker([server.lat, server.lng]).addTo(map)
        .bindPopup(server.name)
        .openPopup();
});

// Add a draggable target
const targetMarker = L.marker([-35.2809, 149.1300], { draggable: true }).addTo(map)
    .bindPopup('Draggable Target')
    .openPopup();

targetMarker.on('dragend', () => {
    const position = targetMarker.getLatLng();
    console.log(`Target moved to: ${position.lat}, ${position.lng}`);
});
