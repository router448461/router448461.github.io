/* Universal reset for consistent layout */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Ensure the HTML and body span the full viewport */
html, body {
    height: 100%; /* Ensure full height */
    width: 100%; /* Ensure full width */
    overflow: hidden; /* Prevent scrolling */
    background-color: #000; /* Set a clean background */
}

/* Map container fills the viewport completely */
#map-container {
    position: fixed; /* Fix to viewport */
    top: 0;
    left: 0;
    width: 100vw; /* Fill entire browser width */
    height: 100vh; /* Fill entire browser height */
    background-color: #000; /* Fallback background if tiles fail */
}
