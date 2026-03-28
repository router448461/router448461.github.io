// --- GLOBAL RISK CLOCK -------------------------------------------------

const LAST_EVENT = new Date("2025-01-01"); // change this

function updateRiskClock() {
  const now = new Date();
  const diff = Math.floor((now - LAST_EVENT) / (1000*60*60*24));
  const risk = Math.min(100, Math.floor(diff / 3));

  document.getElementById("riskclock").innerHTML = `
    UTC ${now.toISOString().slice(11,19)}<br>
    Days since event: ${diff}<br>
    Risk index: ${risk}
  `;
}

setInterval(updateRiskClock, 1000);
updateRiskClock();
