export function startThreatIndicators() {
  const mapContainer = document.getElementById('map');
  function createThreat() {
    const threat = document.createElement('div');
    threat.classList.add('threat-marker');
    const x = Math.random() * mapContainer.clientWidth;
    const y = Math.random() * mapContainer.clientHeight;
    threat.style.left = `${x}px`;
    threat.style.top = `${y}px`;
    mapContainer.appendChild(threat);
    setTimeout(() => { threat.classList.add('fade'); }, 1000);
    setTimeout(() => { threat.remove(); }, 2000);
  }
  setInterval(createThreat, 5000);
}
