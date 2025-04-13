// bootModule.js
export function bootSequence(){
  const bootOverlay = document.getElementById('boot-overlay');
  if(!bootOverlay) return;
  bootOverlay.innerHTML = "ESTABLISHING VIDEO UPLINK...";
  setTimeout(()=>{
    bootOverlay.classList.add('boot-hidden');
    setTimeout(()=>{
      window.location.href = "ai.html";
    },1000);
  },4000);
}
window.addEventListener("load", bootSequence);
