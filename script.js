// script.js
import { bootSequence } from './bootModule.js';
import { initMap } from './mapModule.js';
import { startTimer } from './timerModule.js';
import { startGlitch } from './glitchModule.js';

bootSequence();
setTimeout(() => {
  initMap();
  startTimer();
  startGlitch();
  document.addEventListener('mousemove', (e) => {
    const reticle = document.getElementById('reticle');
    reticle.style.left = `${e.clientX}px`;
    reticle.style.top = `${e.clientY}px`;
    
    // Parallax movement for multiple layers
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = (e.clientX - centerX) * 0.05;
    const deltaY = (e.clientY - centerY) * 0.05;
    
    document.getElementById('hud').style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    document.getElementById('coords').style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    document.getElementById('overlay').style.transform = `translate(${deltaX * 0.5}px, ${deltaY * 0.5}px)`;
    document.getElementById('depth-overlay').style.transform = `translate(${deltaX * 0.3}px, ${deltaY * 0.3}px)`;
    document.getElementById('noise').style.transform = `translate(${deltaX * 0.2}px, ${deltaY * 0.2}px)`;
    document.getElementById('static-overlay').style.transform = `translate(${deltaX * 0.2}px, ${deltaY * 0.2}px)`;
  });
}, 5000);
