// bootModule.js
export function bootSequence(){
  const bootOverlay = document.getElementById('boot-overlay');
  if(!bootOverlay) return;
  bootOverlay.innerHTML = "ESTABLISHING VIDEO UPLINK...";
  setTimeout(()=>{
    bootOverlay.classList.add('boot-hidden');
    setTimeout(()=>{
      bootOverlay.remove();
    },1000);
  },4000);
}
window.addEventListener("load", bootSequence);
