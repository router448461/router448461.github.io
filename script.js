import { initMap } from './mapModule.js';
import { startTimer } from './timerModule.js';

initMap();
startTimer();
document.addEventListener('mousemove', (e) => {
  const reticle = document.getElementById('reticle');
  reticle.style.left = `${e.clientX}px`;
  reticle.style.top = `${e.clientY}px`;
});
