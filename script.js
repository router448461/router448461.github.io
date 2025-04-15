// script.js
import { initMap } from './mapModule.js';
import { startTimer } from './timerModule.js';
import { startGlitch } from './glitchModule.js';

initMap();
startTimer();
startGlitch();

document.addEventListener('mousemove', (e) => {
  // Smoothly update the reticle position using GSAP.
  gsap.to("#reticle", {
    duration: 0.1,
    left: `${e.clientX}px`,
    top: `${e.clientY}px`,
    ease: "power2.out"
  });

  // Apply a parallax effect on the map based on cursor position.
  const parallaxStrength = 0.02; // Adjust for subtleness.
  gsap.to("#map", {
    duration: 0.5,
    x: (e.clientX - window.innerWidth / 2) * parallaxStrength,
    y: (e.clientY - window.innerHeight / 2) * parallaxStrength,
    ease: "power2.out"
  });

  // Update the noise overlay's opacity dynamically.
  const noiseIntensity = (0.1 + Math.random() * 0.1).toFixed(2); // Value between 0.10 and 0.20.
  document.documentElement.style.setProperty('--noise-intensity', noiseIntensity);

  // Update coordinates on the map.
  const mapContainer = document.getElementById('map');
  const rect = mapContainer.getBoundingClientRect();
  if (
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  ) {
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const coords = window.map.unproject([mouseX, mouseY]);
    // Fixed coordinate formatting:
    document.getElementById('coords').innerText = `LAT: ${coords.lat.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}  LON: ${coords.lng.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}`;
  }
});

// Implement a recoil "shake" effect on click to simulate weapon recoil.
document.addEventListener('click', () => {
  gsap.fromTo(
    "#map",
    { x: 0, y: 0 },
    {
      x: "-=5",
      y: "-=5",
      duration: 0.1,
      yoyo: true,
      repeat: 3,
      ease: "power2.inOut"
    }
  );
});

setTimeout(() => {
  const lensOverlay = document.getElementById('lens-overlay');
  if (lensOverlay) { lensOverlay.remove(); }
}, 11000);
