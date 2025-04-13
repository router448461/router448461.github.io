// script.js
import { initMap } from './mapModule.js';
import { startTimer } from './timerModule.js';
import { startGlitch } from './glitchModule.js';
setTimeout(()=>{
  initMap();
  startTimer();
  startGlitch();
  let mouseOffset = { x:0, y:0 };
  let ambientOffset = { x:0, y:0 };
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
  document.addEventListener('click', e=>{
    const mapContainer = document.getElementById('map');
    const rect = mapContainer.getBoundingClientRect();
    if(e.clientX>=rect.left && e.clientX<=rect.right && e.clientY>=rect.top && e.clientY<=rect.bottom){
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const coords = window.theMap.unproject([x,y]);
      const copyText = `${coords.lng.toFixed(6)}, ${coords.lat.toFixed(6)}`;
      navigator.clipboard.writeText(copyText);
    }
  });
},5000);
