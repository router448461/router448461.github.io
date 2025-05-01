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
  const reticle = document.getElementById('reticle');
  let lockTimeout = null;
  document.addEventListener('mousemove', (e) => {
    reticle.style.left = `${e.clientX}px`;
    reticle.style.top = `${e.clientY}px`;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 50 && !reticle.classList.contains('reticle-lock')) {
      reticle.classList.add('reticle-lock');
      if (lockTimeout) clearTimeout(lockTimeout);
      lockTimeout = setTimeout(() => {
        reticle.classList.remove('reticle-lock');
      }, 200);
    }
  });
}, 5000);
