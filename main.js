const map = L.map('map').setView([-42.0, 146.5], 3);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 6,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const origin = [-42.0, 146.5];
const seen = new Set();
const history = JSON.parse(localStorage.getItem('connHistory') || '[]');

console.log('Live Tactical Map initialized. Loaded previous connections:', history.length);
history.forEach(conn => drawConnection(conn));

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    const url = new URL(entry.name);
    const host = url.hostname;
    
    console.log('Detected connection to:', host);
    
    if (!seen.has(host)) {
      seen.add(host);
      
      // Fetch geolocation data from ipinfo.io
      fetch(`https://ipinfo.io/${host}/json?token=20172c7fd830b9`)
        .then(res => res.json())
        .then(data => {
          console.log('Geolocation data received for', host, data);
          
          if (!data.loc) {
            console.error('No location data for', host);
            return;
          }
          
          const [lat, lon] = data.loc.split(',');
          const category = categorizeDomain(host);
          
          // Measure latency and wait for the result
          measureLatency(`https://${host}`).then(latency => {
            const conn = { host, lat, lon, category, time: Date.now(), latency };
            console.log('Drawing connection:', conn);
            drawConnection(conn);
            saveToHistory(conn);
          });
        })
        .catch(err => {
          console.error('Geolocation error for', host, err);
        });
    }
  }
}).observe({ entryTypes: ['resource'] });

function drawConnection(conn) {
  const dest = [parseFloat(conn.lat), parseFloat(conn.lon)];
  
  if (isNaN(dest[0]) || isNaN(dest[1])) {
    console.error('Invalid coordinates for', conn.host, dest);
    return;
  }
  
  const color = getColorByCategory(conn.category);
  console.log('Drawing line to', conn.host, 'with color', color);
  
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
