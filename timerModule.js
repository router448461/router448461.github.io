// timerModule.js
export function startTimer(){
  function updateTimer(){
    const now = new Date();
    const hours = String(now.getHours()).padStart(2,'0');
    const minutes = String(now.getMinutes()).padStart(2,'0');
    const seconds = String(now.getSeconds()).padStart(2,'0');
    const centiseconds = String(Math.floor(now.getMilliseconds()/10)).padStart(2,'0');
    document.getElementById('timer').innerText = `${hours}:${minutes}:${seconds}:${centiseconds}`;
    requestAnimationFrame(updateTimer);
  }
  updateTimer();
}
