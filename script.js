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
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const offsetX = - (e.clientX - centerX) * 0.02;
  const offsetY = - (e.clientY - centerY) * 0.02;
  document.getElementById('map').style.transform = `translate(${offsetX}px, ${offsetY}px)`;
});
