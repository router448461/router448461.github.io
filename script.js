// script.js
import { initMap } from './mapModule.js';
import { startTimer } from './timerModule.js';
import { startGlitch } from './glitchModule.js';

initMap();
startTimer();
startGlitch();

document.addEventListener('mousemove', (e) => {
  const reticle = document.getElementById('reticle');
  
  // Use GSAP to smoothly tween the reticle's left and top properties
  gsap.to(reticle, {
    duration: 0.1,
    left: `${e.clientX}px`,
    top: `${e.clientY}px`,
    ease: "power2.out"
  });

  const mapContainer = document.getElementById('map');
  const rect = mapContainer.getBoundingClientRect();
  if (
    e.clientX >= rect.left && e.clientX <= rect.right &&
    e.clientY >= rect.top && e.clientY <= rect.bottom
  ) {
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const coords = window.map.unproject([mouseX, mouseY]);
    document.getElementById('coords').innerText = `LAT: ${coords.lat.toFixed(3)}  LON: ${coords.lng.toFixed(3)}`;
  }
});

setTimeout(() => {
  const lensOverlay = document.getElementById('lens-overlay');
  if (lensOverlay) { lensOverlay.remove(); }
}, 11000);
