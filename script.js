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
  const parallaxStrength = 0.02; // tweak this value for subtleness
  gsap.to("#map", {
    duration: 0.5,
    x: (e.clientX - window.innerWidth / 2) * parallaxStrength,
    y: (e.clientY - window.innerHeight / 2) * parallaxStrength,
    ease: "power2.out"
  });

  // Adjust dynamic noise intensity based on mouse movement.
  const noiseIntensity = (0.1 + Math.random() * 0.1).toFixed(2); // a value between 0.1 and 0.2
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
    document.getElementById('coords').innerText = `LAT: ${coords.lat.toFixed(
      3
    )}  LON: ${coords.lng.toFixed(3)}`;
  }
});

// Implement a recoil "shake" effect on clicking to simulate weapon recoil.
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

// (Optional) If you want to further control reticle jitter via GSAP rather than CSS keyframes,
// you can disable the CSS jitter and uncomment the following code:
/*
const reticleJitter = gsap.timeline({ repeat: -1, paused: false });
reticleJitter.to("#reticle", {
  duration: 0.2,
  x: "+=" + (Math.random() * 2 - 1),
  y: "+=" + (Math.random() * 2 - 1),
  ease: "power1.inOut"
});
*/
  
setTimeout(() => {
  const lensOverlay = document.getElementById('lens-overlay');
  if (lensOverlay) {
    lensOverlay.remove();
  }
}, 11000);
