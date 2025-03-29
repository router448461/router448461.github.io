:root {
    --line-color: red;
    --dot-color: red;
    --contrast-outline-color: white;
    --animation-duration: 30s; /* Match scrolling text animation to page refresh */
    --day-bg-color: #f0f0f0;
    --night-bg-color: #000;
}

body, * {
    margin: 0;
    padding: 0;
    user-select: none; /* Disable text selection globally */
    -webkit-user-drag: none; /* Disable dragging globally */
}

body {
    overflow: hidden; /* Disable scrolling */
    background-color: var(--night-bg-color);
    font-family: Arial, sans-serif;
}

#map-container {
    position: relative;
    width: 100vw;
    height: 100vh;
}

.scrolling-text {
    position: absolute; /* Place within the map */
    top: 20px; /* Align inside the map container */
    left: -100%; /* Start completely off-screen */
    font-size: 24px;
    font-weight: bold;
    color: red;
    z-index: 1000; /* Ensure it appears above all elements */
    animation: scroll-text var(--animation-duration) linear infinite; /* Match animation with 30s duration */
}

@keyframes scroll-text {
    from {
        left: -100%;
    }
    to {
        left: 100%;
    }
}

#coordinates-panel, #time-panel {
    position: absolute;
    color: white;
    font-size: 16px;
    background-color: rgba(0, 0, 0, 0.7);
    padding: 10px;
    border-radius: 5px;
}

#coordinates-panel {
    bottom: 10px;
    left: 10px;
}

#time-panel {
    top: 10px;
    right: 10px;
}

.blinking-dot {
    width: 10px;
    height: 10px;
    background-color: var(--dot-color);
    border: 2px solid var(--contrast-outline-color);
    border-radius: 50%;
    animation: blink-animation 1s infinite; /* Dots blink every second */
    position: absolute;
    transform: translate(-50%, -50%);
}

@keyframes blink-animation {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
}
