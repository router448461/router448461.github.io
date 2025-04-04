:root {
  --edge-color: #8B0000;
  --center-color: #FF0000;
  --min-thickness: 0.5px;
  --max-thickness: 2px;
  /* Cross lines draw over 9 seconds */
  --line-duration: 9s;
  --animation-delay: 0s;
  --box-shadow-color: rgba(255, 0, 0, 0.7);
  --shadow-blur: 5px;
  --shadow-spread: 1px;
}

/* Disable text selection and always use default pointer */
* {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  cursor: default;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* Map styling – filtered for increased contrast and a tactical look */
#map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  visibility: hidden;  /* will be enabled when the map has fully loaded */
  filter: contrast(1.2) brightness(0.9);
}

.mapboxgl-canvas {
  cursor: default !important;
}

.mapboxgl-ctrl-attrib,
.mapboxgl-ctrl-bottom-left {
  display: none !important;
}

/* Overlay for the cross lines */
#overlay {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
}

/* Base style for cross lines – animations start paused */
.line {
  position: absolute;
  box-shadow: 0 0 var(--shadow-blur) var(--shadow-spread) var(--box-shadow-color);
  animation: pulseLine 1.5s infinite alternate;
  animation-play-state: paused;
}

/* Simple pulse for visual effect */
@keyframes pulseLine {
  from { filter: brightness(1); }
  to { filter: brightness(1.2); }
}

/* Horizontal cross lines */
.line.horizontal {
  top: 50%;
  width: 50vw;
  height: var(--min-thickness);
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.9) 0%,
    var(--edge-color) 15%,
    var(--center-color) 50%,
    var(--edge-color) 85%,
    rgba(0, 0, 0, 0.9) 100%
  );
  transform: scaleX(0);
  transform-origin: left center;
  animation: expandHorizontal var(--line-duration) forwards,
             growThickness var(--line-duration) forwards;
  animation-delay: var(--animation-delay), var(--animation-delay);
}

.line.horizontal.right {
  right: 0;
  left: auto;
  transform-origin: right center;
}

@keyframes expandHorizontal {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes growThickness {
  from { height: var(--min-thickness); }
  to { height: var(--max-thickness); }
}

/* Vertical cross lines */
.line.vertical {
  left: 50%;
  height: 50vh;
  width: var(--min-thickness);
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.9) 0%,
    var(--edge-color) 15%,
    var(--center-color) 50%,
    var(--edge-color) 85%,
    rgba(0, 0, 0, 0.9) 100%
  );
  transform: scaleY(0);
  transform-origin: top center;
  animation: expandVertical var(--line-duration) forwards,
             growThicknessV var(--line-duration) forwards;
  animation-delay: var(--animation-delay), var(--animation-delay);
}

.line.vertical.bottom {
  bottom: 0;
  top: auto;
  transform-origin: bottom center;
}

@keyframes expandVertical {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

@keyframes growThicknessV {
  from { width: var(--min-thickness); }
  to { width: var(--max-thickness); }
}

/* Scanlines overlay for a digital CRT effect */
#scanlines {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 15;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 3px
  );
}

/* Radar sweep overlay – a rotating red circle in the center */
#radar {
  pointer-events: none;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  margin-left: -150px; /* half the width */
  margin-top: -150px;  /* half the height */
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 0, 0, 0.2) 0%, transparent 70%);
  animation: radarRotate 3s linear infinite;
  z-index: 20;
}

@keyframes radarRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* HUD styling for the top-right panel */
#hud {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid var(--center-color);
  border-radius: 4px;
  font-family: 'VT323', monospace;
  color: var(--center-color);
  font-size: 24px;
  text-align: right;
  z-index: 25;
}

/* Timer styling inside the HUD */
#timer {
  margin: 0;
}
