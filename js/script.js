// js/script.js

(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // Ensure Leaflet loaded
    if (typeof L === 'undefined') {
      console.error('Leaflet (L) is not defined. Check that leaflet.js is included correctly.');
      return;
    }

    // 1. Initialize map centered on Ancient Canaan
    const map = L.map('map', {
      center: [31.8, 35.4],
      zoom: 7,
      zoomControl: false,
      attributionControl: false
    });

    // 2. Add dark basemap
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 10,
        tileSize: 512,
        zoomOffset: -1
      }
    ).addTo(map);

    // 3. Define ancient city sites
    const sites = [
      { name: 'Jericho', coords: [31.8667, 35.4500] },
      { name: 'Ai',      coords: [31.9077, 35.2790] },
      { name: 'Hazor',   coords: [32.8650, 35.5350] }
    ];

    // 4. Add pulsing blip markers
    sites.forEach(site => {
      const icon = L.divIcon({
        className: 'site-marker',
        html: '<div class="blip"></div>',
        iconSize: [16, 16]
      });
      L.marker(site.coords, { icon, interactive: false }).addTo(map);
    });

    // 5. Draw troop movement (dashed polyline)
    const route = [
      [31.9,     35.2],
      [31.9077,  35.2790],
      [31.8667,  35.4500]
    ];
    L.polyline(route, {
      color: '#39ff14',
      weight: 2,
      dashArray: '6,4'
    })
    .addTo(map)
    .bindTooltip('Troop Advance', { permanent: true, direction: 'bottom' });

    // 6. Place arrowhead at end of route
    const arrowIcon = L.divIcon({
      className: 'arrow-icon',
      html: '&#9654;',
      iconSize: [16, 16]
    });
    // last coordinate of the route
    const endCoords = route[route.length - 1];
    L.marker(endCoords, { icon: arrowIcon, interactive: false }).addTo(map);

    // 7. Binary ticker generation
    const binaryEl = document.querySelector('.overlay.binary');
    if (!binaryEl) {
      console.error('Binary overlay element not found');
    } else {
      const genBinary = length =>
        Array.from({ length }, () => (Math.random() > 0.5 ? '1' : '0')).join(' ');
      const updateBinary = () => {
        binaryEl.textContent = genBinary(200);
      };
      updateBinary();
      setInterval(updateBinary, 2500);
    }

    console.log('🛡️ Joshua’s military map initialized.');
  });
})();
