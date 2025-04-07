// script.js
import { bootSequence } from './bootModule.js';
import { initMap } from './mapModule.js';
import { startTimer } from './timerModule.js';
import { startGlitch } from './glitchModule.js';

bootSequence();
// Start all features as soon as the boot screen is complete.
// (If needed, adjust the delay so that they start immediately after bootOverlay removal.)
setTimeout(() => {
  initMap();
  startTimer();
  startGlitch();
  document.addEventListener('mousemove', (e) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const maxOffset = 20;
    const rawDeltaX = (e.clientX - centerX) * 0.05;
    const rawDeltaY = (e.clientY - centerY) * 0.05;
    const deltaX = Math.max(-maxOffset, Math.min(maxOffset, rawDeltaX));
    const deltaY = Math.max(-maxOffset, Math.min(maxOffset, rawDeltaY));
    
    // Apply clamped parallax to HUD and static elements
    document.getElementById('hud').style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    document.getElementById('coords').style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    document.getElementById('overlay').style.transform = `translate(${deltaX * 0.5}px, ${deltaY * 0.5}px)`;
    document.getElementById('depth-overlay').style.transform = `translate(${deltaX * 0.3}px, ${deltaY * 0.3}px)`;
    document.getElementById('noise').style.transform = `translate(${deltaX * 0.2}px, ${deltaY * 0.2}px)`;
    document.getElementById('static-overlay').style.transform = `translate(${deltaX * 0.2}px, ${deltaY * 0.2}px)`;
    
    // Update reticle position (jitter is handled in CSS)
    const reticle = document.getElementById('reticle');
    reticle.style.left = `${e.clientX}px`;
    reticle.style.top = `${e.clientY}px`;
  });
}, 5000);
