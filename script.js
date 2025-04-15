// script.js
import { initMap } from './mapModule.js';
import { startTimer } from './timerModule.js';
import { startGlitch } from './glitchModule.js';
initMap();
startTimer();
startGlitch();
function formatCoord(num) {
  const sign = num >= 0 ? "+" : "-";
  const intPart = Math.floor(Math.abs(num));
  const frac = Math.abs(num) - intPart;
  const intStr = intPart.toString().padStart(3, "0");
  const fracStr = frac.toFixed(3).slice(2);
  return sign + intStr + "." + fracStr;
}
document.addEventListener('mousemove', (e) => {
  gsap.to("#reticle", {
    duration: 0.1,
    left: `${e.clientX}px`,
    top: `${e.clientY}px`,
    ease: "power2.out"
  });
  const parallaxStrength = 0.02;
  gsap.to("#map", {
    duration: 0.5,
    x: (e.clientX - window.innerWidth / 2) * parallaxStrength,
    y: (e.clientY - window.innerHeight / 2) * parallaxStrength,
    ease: "power2.out"
  });
  const noiseIntensity = (0.1 + Math.random() * 0.1).toFixed(2);
  document.documentElement.style.setProperty('--noise-intensity', noiseIntensity);
  const mapContainer = document.getElementById('map');
  const rect = mapContainer.getBoundingClientRect();
  if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const coords = window.map.unproject([mouseX, mouseY]);
    document.getElementById('coords').innerText = `LAT: ${formatCoord(coords.lat)}  LON: ${formatCoord(coords.lng)}`;
  }
});
document.addEventListener('click', () => {
  gsap.fromTo("#map", { x: 0, y: 0 }, { x: "-=5", y: "-=5", duration: 0.1, yoyo: true, repeat: 3, ease: "power2.inOut" });
});
setTimeout(() => {
  const lensOverlay = document.getElementById('lens-overlay');
  if (lensOverlay) { lensOverlay.remove(); }
}, 11000);
