// Initialize the map
const map = L.map('map').setView([-25.2744, 133.7751], 4); // Center on Australia

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
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
