(() => {
  'use strict';

  // Wait until the DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Leaflet Map
    const map = L.map('map', {
      center: [31.8, 35.4], // Ancient Canaan center
      zoom: 7,
      zoomControl: false,
      attributionControl: false
    });

    // 2. Add Dark Basemap for Ominous Feel
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 10, tileSize: 512, zoomOffset: -1 }
    ).addTo(map);

    // 3. Ancient City Sites Data
    const sites = [
      { name: 'Jericho', coords: [31.8667, 35.4500] },
      { name: 'Ai',      coords: [31.9077, 35.2790] },
      { name: 'Hazor',   coords: [32.8650, 35.5350] }
    ];

    // 4. Add Pulsing Blip Markers
    sites.forEach(site => {
      const icon = L.divIcon({
        className: 'site-marker',
        html: '<div class="blip"></div>',
        iconSize: [16, 16]
      });
      L.marker(site.coords, { icon, interactive: false }).addTo(map);
    });

    // 5. Draw Troop Movement Polyline
    L.polyline(
      [
        [31.9,     35.2],
        [31.9077,  35.2790],
        [31.8667,  35.4500]
      ],
      { color: '#39ff14', weight: 2, dashArray: '6,4' }
    ).addTo(map)
      .bindTooltip('Troop Advance', { permanent: true, direction: 'bottom' });

    // 6. Add Arrow Icon at Polyline End
    const arrowIcon = L.divIcon({
      className: 'arrow-icon',
      html: '&#9654;',
      iconSize: [16, 16]
    });
    L.marker([31.87, 35.44], { icon: arrowIcon, interactive: false }).addTo(map);

    // 7. Generate & Update Scrolling Binary Code
    const binaryEl = document.querySelector('.overlay.binary');
    const genBinary = length =>
      Array.from({ length }, () => (Math.random() > 0.5 ? '1' : '0')).join(' ');
    const refreshBinary = () => {
      binaryEl.textContent = genBinary(200);
    };
    refreshBinary();
    setInterval(refreshBinary, 2500);

    console.log('🛡️ Joshua’s military map initialized.');
  });
})();
