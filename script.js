window.onload = function() {
    // Initialize the map with various settings
    var map = initializeMap();

    // Load the tile layer onto the map
    var tileLayer = loadTileLayer(map);

    // Handle tile loading errors
    handleTileErrors(tileLayer);

    // Prevent zooming past a certain level
    preventZoom(map);

    // Disable scroll wheel zoom
    map.scrollWheelZoom.disable();

    // Define the names and locations of the servers
    var dnsServers = [
        'ns8.dynu.com', // AU, SYDNEY
        'ns9.dynu.com'  // SG, SINGAPORE
    ];

    var dnsServerLocations = [
        'SYDNEY, AU', // NS 8.DYNU.COM
        'SINGAPORE, SP' // NS 9.DYNU.COM
    ];

    // Fetch the IP and geolocation data for each server
    fetchIPandGeolocationData(dnsServers, dnsServerLocations, map);

    // Reload the page every 5 minutes
    setTimeout(function() {
        location.reload();
    }, 300000);

    // Handle window resize events
    handleWindowResize(map);

    // Flash the screen white after 3 seconds
    flashScreenWhite();
};

function initializeMap() {
    // Your existing map initialization code here
}

function loadTileLayer(map) {
    // Your existing tile layer loading code here
}

function handleTileErrors(tileLayer) {
    // Your existing tile error handling code here
}

function preventZoom(map) {
    // Your existing zoom prevention code here
}

function fetchIPandGeolocationData(dnsServers, dnsServerLocations, map) {
    // Your existing IP and geolocation fetching code here
}

function handleWindowResize(map) {
    // Your existing window resize handling code here
}

function flashScreenWhite() {
    // Your existing screen flashing code here
}
