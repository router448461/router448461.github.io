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
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let targetRotation = 0;
  let currentRotation = 0;
  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    targetRotation = ((e.clientX - window.innerWidth / 2) / window.innerWidth) * 20;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = (e.clientX - centerX) * 0.02;
    const offsetY = (e.clientY - centerY) * 0.02;
    const map = document.getElementById('map');
    if(map){
      map.style.setProperty('--parallax-x', offsetX + 'px');
      map.style.setProperty('--parallax-y', offsetY + 'px');
    }
  });
  function animateReticle() {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;
    currentRotation += (targetRotation - currentRotation) * 0.1;
    reticle.style.transform = `translate(-50%, -50%) translate(${currentX}px, ${currentY}px) rotate(${currentRotation}deg)`;
    requestAnimationFrame(animateReticle);
  }
  animateReticle();
}, 5000);
