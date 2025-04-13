// glitchModule.js
export function startGlitch(){
  const glitchOverlay = document.getElementById('glitch-overlay');
  function triggerGlitch(){
    glitchOverlay.classList.add('glitch-active');
    const hueRotation = Math.floor(Math.random() * 20 - 10);
    const blurVal = Math.random() * 2;
    glitchOverlay.style.filter = `hue-rotate(${hueRotation}deg) blur(${blurVal}px)`;
    const mapElem = document.getElementById('map');
    mapElem.classList.add('camera-shake');
    const randomBrightness = (0.9 + Math.random() * 0.2).toFixed(2);
    const randomHue = Math.floor(Math.random() * 20 - 10);
    mapElem.style.filter = `contrast(1.2) brightness(${randomBrightness}) saturate(1.1) hue-rotate(${randomHue}deg)`;
    setTimeout(()=>{
      glitchOverlay.classList.remove('glitch-active');
      glitchOverlay.style.filter = '';
      mapElem.classList.remove('camera-shake');
      mapElem.style.filter = `contrast(1.2) brightness(0.9) saturate(1.1) hue-rotate(-10deg)`;
    }, 300);
    const nextGlitch = Math.random() * 5000 + 2000;
    setTimeout(triggerGlitch, nextGlitch);
  }
  triggerGlitch();
}
