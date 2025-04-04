mapboxgl.accessToken = 'pk.eyJ1Ijoicm91dGVyNDQ4NDYxIiwiYSI6ImNtOHpoZ2ZzZTBjMDIya29tcXB4d3dmZXoifQ.F1i6qsnyKqm_8-HUyu070A';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [0, 0],
  zoom: 2,
  attributionControl: false
});

map.dragPan.disable();
map.dragRotate.disable();
map.scrollZoom.disable();
map.doubleClickZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
map.touchZoomRotate.disable();

document.addEventListener('mousemove', function(e) {
  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  document.getElementById('overlay').style.transform = `translate(${x}px, ${y}px)`;
  document.getElementById('map').style.transform = `translate(${x/2}px, ${y/2}px)`;
  document.getElementById('hud').style.transform = `translate(${x/2}px, ${y/2}px)`;
});

map.on('load', function() {
  // Blast Radius source and layer removed
});

function randomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const messages = ["TARGET LOCKED", "WEAPON ARMED", "SYSTEMS ONLINE", "ENEMY DETECTED"];
let commsText = "";
for (let i = 0; i < 100; i++) {
  commsText += randomString(20) + " " + messages[i % messages.length] + " ";
}
document.getElementById("comms-text").innerText = commsText;

setInterval(() => {
  const lat = (Math.random() * 180 - 90).toFixed(3);
  const lon = (Math.random() * 360 - 180).toFixed(3);
  document.getElementById("target-coords").innerText = `TARGET: ${lat}, ${lon}`;

  const statuses = ["ONLINE", "CHARGING", "FIRING", "COOLING"];
  document.getElementById("weapon-status").innerText = `WEAPON: ${statuses[Math.floor(Math.random() * statuses.length)]}`;

  const threats = ["LOW", "MEDIUM", "HIGH"];
  const threat = threats[Math.floor(Math.random() * threats.length)];
  document.getElementById("threat-level").innerText = `THREAT: ${threat}`;

  const threatBar = document.getElementById("threat-bar");
  if (threat === "LOW") {
    threatBar.style.width = "30%";
    threatBar.style.backgroundColor = "green";
  } else if (threat === "MEDIUM") {
    threatBar.style.width = "60%";
    threatBar.style.backgroundColor = "yellow";
  } else {
    threatBar.style.width = "100%";
    threatBar.style.backgroundColor = "red";
  }
}, 2000);
