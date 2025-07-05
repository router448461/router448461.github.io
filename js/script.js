(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof L === 'undefined') {
      console.error('Leaflet not loaded.');
      return;
    }

    // SHAKE trigger on load
    const mapEl = document.getElementById('map');
    mapEl.classList.add('shake');
    setTimeout(() => mapEl.classList.remove('shake'), 1000);

    // 1. Init map
    const map = L.map('map', {
      center: [31.8, 35.4],
      zoom: 7,
      zoomControl: false,
      attributionControl: false
    });

    // 2. Dark basemap
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 12, tileSize: 512, zoomOffset: -1 }
    ).addTo(map);

    // 3. Hazard zone around Jericho
    const jerichoZone = L.circle([31.8667, 35.4500], {
      radius: 20000, // meters
      color: 'red',
      fillColor: 'darkred',
      fillOpacity: 0.2,
      weight: 2,
      dashArray: '8,4'
    }).addTo(map);

    // zone pulse
    setInterval(() => {
      jerichoZone.setStyle({ fillOpacity: Math.random() * 0.3 + 0.1 });
    }, 1000);

    // 4. Sites & blips
    const sites = [
      { name: 'Jericho', coords: [31.8667, 35.4500] },
      { name: 'Ai',      coords: [31.9077, 35.2790] },
      { name: 'Hazor',   coords: [32.8650, 35.5350] }
    ];
    sites.forEach(s => {
      const icon = L.divIcon({ className: 'site-marker', html:'<div class="blip"></div>' });
      L.marker(s.coords, { icon, interactive:false }).addTo(map);
    });

    // 5. Troop route + arrow
    const route = [[31.9,35.2],[31.9077,35.2790],[31.8667,35.4500]];
    L.polyline(route, { color:'lime', weight:2, dashArray:'6,4' })
     .addTo(map)
     .bindTooltip('Troop Advance', { permanent:true, direction:'bottom' });
    const arrow = L.divIcon({ className:'arrow-icon', html:'&#9654;' });
    L.marker(route.slice(-1)[0], { icon:arrow, interactive:false }).addTo(map);

    // 6. Binary ticker
    const binEl = document.querySelector('.overlay.binary');
    const gen = len => Array.from({length:len}, ()=>Math.random()>0.5?'1':'0').join(' ');
    const tick = () => binEl && (binEl.textContent = gen(200));
    tick();
    setInterval(tick, 2500);

    // 7. Random glitch flashes
    const glitchEl = document.querySelector('.overlay.glitch');
    setInterval(() => glitchEl.classList.toggle('active'), 1500);

    console.log('🔥 Scary Joshua map live.');
  });
})();
