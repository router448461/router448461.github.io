const map = L.map('map').setView([-42.0, 146.5], 3);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 6,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const origin = [-42.0, 146.5];
const seen = new Set();
const history = JSON.parse(localStorage.getItem('connHistory') || '[]');

history.forEach(conn => drawConnection(conn));

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    const url = new URL(entry.name);
    const host = url.hostname;
    if (!seen.has(host)) {
      seen.add(host);
      fetch(`https://ipinfo.io/${host}/json?token=20172c7fd830b9`)
        .then(res => res.json())
        .then(data => {
          const [lat, lon] = data.loc.split(',');
          const category = categorizeDomain(host);
          measureLatency(`https://${host}`).then(latency => {
            const conn = { host, lat, lon, category, time: Date.now(), latency };
            drawConnection(conn);
            saveToHistory(conn);
          });
        })
        .catch(err => console.log('Geolocation error for', host));
    }
  }
}).observe({ entryTypes: ['resource'] });

function drawConnection(conn) {
  const dest = [parseFloat(conn.lat), parseFloat(conn.lon)];
  const color = getColorByCategory(conn.category);
  const line = L.polyline([origin, dest], {
    color,
    weight: 2,
    opacity: 0.7,
    dashArray: '5, 10'
  }).addTo(map);

  L.circleMarker(dest, {
    radius: 4,
    color,
    fillOpacity: 0.8
  }).addTo(map).bindPopup(`${conn.host}<br>${conn.category}<br>${conn.latency || '...'} ms`);
}

function saveToHistory(conn) {
  history.push(conn);
  localStorage.setItem('connHistory', JSON.stringify(history));
}
