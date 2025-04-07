// script.js
import { bootSequence } from './bootModule.js';
import { initMap } from './mapModule.js';
import { startTimer } from './timerModule.js';
import { startGlitch } from './glitchModule.js';

bootSequence();
setTimeout(()=>{
  initMap();
  startTimer();
  startGlitch();
  document.addEventListener('mousemove', (e)=>{
    const centerX = window.innerWidth/2;
    const centerY = window.innerHeight/2;
    const maxOffset = 20;
    const rawDeltaX = (e.clientX - centerX)*0.05;
    const rawDeltaY = (e.clientY - centerY)*0.05;
    const deltaX = Math.max(-maxOffset, Math.min(maxOffset, rawDeltaX));
    const deltaY = Math.max(-maxOffset, Math.min(maxOffset, rawDeltaY));
    document.getElementById('map').style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  });
},5000);
