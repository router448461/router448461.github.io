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
  let mouseOffset = { x: 0, y: 0 };
  let ambientOffset = { x: 0, y: 0 };
  let lastMouseX = 0;
  let lastMouseY = 0;
  let lastMouseTime = Date.now();
  document.addEventListener('mousemove', (e)=>{
    const centerX = window.innerWidth/2;
    const centerY = window.innerHeight/2;
    const maxOffset = 20;
    const rawDeltaX = (e.clientX - centerX)*0.05;
    const rawDeltaY = (e.clientY - centerY)*0.05;
    mouseOffset.x = Math.max(-maxOffset, Math.min(maxOffset, rawDeltaX));
    mouseOffset.y = Math.max(-maxOffset, Math.min(maxOffset, rawDeltaY));
    const reticle = document.getElementById('reticle');
    reticle.style.left = `${e.clientX}px`;
    reticle.style.top = `${e.clientY}px`;
    const currentTime = Date.now();
    const deltaTime = currentTime - lastMouseTime;
    const distance = Math.sqrt(Math.pow(e.clientX - lastMouseX,2)+Math.pow(e.clientY - lastMouseY,2));
    if(deltaTime > 0 && distance/deltaTime > 1){
      document.getElementById('noise').classList.add('fast-move');
      setTimeout(()=>{
        document.getElementById('noise').classList.remove('fast-move');
      },200);
    }
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    lastMouseTime = currentTime;
  });
  function updateAmbientDrift(){
    const t = Date.now();
    ambientOffset.x = Math.sin(t/5000)*10 + Math.sin(t/7000)*5;
    ambientOffset.y = Math.cos(t/5000)*10 + Math.cos(t/7000)*5;
    requestAnimationFrame(updateAmbientDrift);
  }
  updateAmbientDrift();
  function updateMapTransform(){
    const combinedX = mouseOffset.x + ambientOffset.x;
    const combinedY = mouseOffset.y + ambientOffset.y;
    document.getElementById('map').style.transform = `scale(1.1) translate(${combinedX}px, ${combinedY}px)`;
    requestAnimationFrame(updateMapTransform);
  }
  updateMapTransform();
},5000);
