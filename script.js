window.onload = function() {
    var map = L.map('map', {
        zoomControl: false,
        dragging: false,
        attributionControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        worldCopyJump: true,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0,
        touchZoom: false,
    }).setView([0, 0], 2);

    var tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
        attribution: '',
        noWrap: false,
        errorTileUrl: 'path/to/fallback-tile.png'
    }).addTo(map);

    tileLayer.on('tileerror', function(error, tile) {
        console.error('Tile loading error:', error);
        console.error('Failed tile:', tile);
    });

    map.on('zoomend', function() {
        map.setZoom(2);
    });

    map.scrollWheelZoom.disable();

    var nameServers = [
        'nc1.dns.oss-core.net',
        'ns8.dynu.com',
        'ns9.dynu.com',
        'dawn.ns.cloudflare.com',
        'peter.ns.cloudflare.com'
    ];

    var nameServerCoords = [
        [-33.865143, 151.209900],
        [-33.865143, 151.209900],
        [1.352083, 103.819839],
        [37.7749, -122.4194],
        [51.5074, -0.1278]
    ];

    var nameServerLocations = [
        'SYDNEY, AU',
        'SYDNEY, AU',
        'SINGAPORE, SP',
        'SAN FRANCISCO, US',
        'LONDON, UK'
    ];

    function getIP(nameServer) {
        if (nameServer === '111.220.1.1') {
            return Promise.resolve({ ipAddress: nameServer, hostname: 'nc1.dns.oss-core.net' });
        } else if (nameServer === 'dawn.ns.cloudflare.com') {
            return Promise.resolve({ ipAddress: '173.245.58.106', hostname: nameServer });
        } else if (nameServer === 'peter.ns.cloudflare.com') {
            return Promise.resolve({ ipAddress: '173.245.59.136', hostname: nameServer });
        }

        return fetch(`https://dns.google/resolve?name=${nameServer}`)
            .then(response => response.json())
            .then(data => ({ ipAddress: data.Answer[0].data, hostname: nameServer }))
            .catch(error => console.error('Error:', error));
    }

    Promise.all(nameServers.map(function(nameServer, index) {
        return getIP(nameServer).then(result => {
            return { ...result, index, location: nameServerLocations[index] };
        });
    })).then(results => {
        results.forEach(result => {
            var dot = L.divIcon({
                className: 'dot',
                html: `<div style="background-color: #ff0000; width: 10px; height: 10px; border-radius: 50%; animation: blink 1s infinite;"> </div>`
            });
            var marker = L.marker(nameServerCoords[result.index], { icon: dot }).addTo(map);
            var tooltipDirection = result.hostname === 'nc1.dns.oss-core.net' ? "left" : "right";
            var tooltipContent = `IP: ${result.ipAddress}<br>LAT: ${nameServerCoords[result.index][0]}<br>LON: ${nameServerCoords[result.index][1]}<br>${result.hostname.toUpperCase()}<br>${result.location}`;
            marker.bindTooltip(`<span style="color: #ff0000">${tooltipContent}</span>`, { permanent: true, direction: tooltipDirection, offset: [10, 0], className: "myCSSClass" });
        });
    });

    fetch('http://ip-api.com/json/')
        .then(response => response.json())
        .then(data => {
            var dot = L.divIcon({
                className: 'dot',
                html: `<div style="background-color: #00ff00; width: 10px; height: 10px; border-radius: 50%; animation: blink 1s infinite;"> </div>`
            });
            var marker = L.marker([data.lat, data.lon], { icon: dot }).addTo(map);
            var popupContent = `IP: ${data.query}<br>LAT: ${data.lat}<br>LON: ${data.lon}<br>${data.as}<br>${data.city}, ${data.regionName}, ${data.country}`;
            marker.bindPopup(`<span class="visitor-popup" style="color: #00ff00">${popupContent}</span>`, { offset: [0, 13], className: "myCSSClass" }).openPopup();

            // Move visitor location data to the top right corner
            var visitorInfo = document.createElement('div');
            visitorInfo.id = 'visitor-info';
            visitorInfo.innerHTML = popupContent;
            visitorInfo.style.position = 'absolute';
            visitorInfo.style.top = '10px';
            visitorInfo.style.right = '10px';
            visitorInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            visitorInfo.style.color = '#00ff00';
            visitorInfo.style.padding = '10px';
            visitorInfo.style.borderRadius = '5px';
            visitorInfo.style.zIndex = '1001';
            document.getElementById('map').appendChild(visitorInfo);
        })
        .catch(error => console.error('Error:', error));

    setTimeout(function() {
        location.reload();
    }, 300000);

    window.addEventListener('resize', function() {
        map.invalidateSize();
    });

    setTimeout(function() {
        map.invalidateSize();
    }, 100);

    setTimeout(function() {
        var flashLayer = document.getElementById('flash-layer');
        flashLayer.style.backgroundColor = '#ffffff';
        flashLayer.style.transition = 'background-color 0.5s ease-in-out';
        setTimeout(function() {
            flashLayer.style.backgroundColor = 'transparent';
        }, 500);
    }, 3000);
};
