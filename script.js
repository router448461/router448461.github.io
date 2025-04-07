// script.js
import { initMap } from './mapModule.js';
import { startTimer } from './timerModule.js';
import { bootSequence } from './bootModule.js';
import { startGlitch } from './glitchModule.js';

bootSequence();
initMap();
startTimer();
startGlitch();

document.addEventListener('mousemove', (e) => {
  const reticle = document.getElementById('reticle');
  reticle.style.left = `${e.clientX}px`;
  reticle.style.top = `${e.clientY}px`;
});
