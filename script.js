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

    var uluruCoords = [-25.3444, 131.0369];

    var nameServers = [
        'ns1.dynu.com', 'ns2.dynu.com', 'ns3.dynu.com', 'ns4.dynu.com', 'ns5.dynu.com', 'ns6.dynu.com', 'ns7.dynu.com', 'ns8.dynu.com', 'ns9.dynu.com', 'ns10.dynu.com', 'ns11.dynu.com', 'ns12.dynu.com'
    ];

    var nameServerCoords = [
        [34.0000, -118.0000], // NS1.DYNU.COM (LOS ANGELES, US)
        [33.0000, -112.0000], // NS2.DYNU.COM (PHOENIX, US)
        [33.0000, -84.0000],  // NS3.DYNU.COM (ATLANTA, US)
        [32.0000, -96.0000],  // NS4.DYNU.COM (DALLAS, US)
        [47.0000, -122.0000], // NS5.DYNU.COM (SEATTLE, US)
        [40.0000, -74.0000],  // NS6.DYNU.COM (NEW JERSEY, US)
        [35.0000, 139.0000],  // NS7.DYNU.COM (TOKYO, JP)
        [-33.0000, 151.0000], // NS8.DYNU.COM (SYDNEY, AU)
        [1.0000, 103.0000],   // NS9.DYNU.COM (SINGAPORE, SG)
        [52.0000, 4.0000],    // NS10.DYNU.COM (AMSTERDAM, NL)
        [50.0000, 8.0000],    // NS11.DYNU.COM (FRANKFURT, DE)
        [51.0000, -0.0000]    // NS12.DYNU.COM (LONDON, UK)
    ];

    function haversineDistance(coords1, coords2) {
        var R = 6371;
        var dLat = (coords2[0] - coords1[0]) * Math.PI / 180;
        var dLng = (coords2[1] - coords1[1]) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(coords1[0] * Math.PI / 180) * Math.cos(coords2[0] * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    var distances = nameServerCoords.map(function(coords, index) {
        return { coords: coords, distance: haversineDistance(uluruCoords, coords), nameServer: nameServers[index] };
    });

    distances.sort(function(a, b) {
        return a.distance - b.distance;
    });

    var latlngs = distances.map(function(item) {
        return item.coords;
    }).concat([uluruCoords]);

    var polyline = L.polyline([], {color: '#ffffff', weight: 1}).addTo(map);

    var totalDuration = 30000;
    var steps = 100;
    var interval = totalDuration / steps;
    var step = 0;

    var drawLine = setInterval(function() {
        if (step < steps) {
            var currentIndex = Math.floor(step / (steps / latlngs.length));
            var nextIndex = currentIndex + 1;
            if (nextIndex < latlngs.length) {
                var lat = latlngs[currentIndex][0] + (latlngs[nextIndex][0] - latlngs[currentIndex][0]) * ((step % (steps / latlngs.length)) / (steps / latlngs.length));
                var lng = latlngs[currentIndex][1] + (latlngs[nextIndex][1] - latlngs[currentIndex][1]) * ((step % (steps / latlngs.length)) / (steps / latlngs.length));
                polyline.addLatLng([lat, lng]);
                console.log([lat, lng]);
            }
            step++;
        } else {
            clearInterval(drawLine);
        }
    }, interval);

    var ipInfo = document.getElementById('ip-info');
    ipInfo.style.color = '#ff0000';
    ipInfo.style.fontFamily = 'Courier New, Courier, monospace';

    function formatIP(ip) {
        return ip.split('.').map(num => num.padStart(3, '0')).join('.');
    }

    function getIP(nameServer) {
        return fetch(`https://dns.google/resolve?name=${nameServer}`)
            .then(response => response.json())
            .then(data => formatIP(data.Answer[0].data))
            .catch(error => console.error('Error:', error));
    }

    Promise.all(distances.map(function(item) {
        return getIP(item.nameServer);
    })).then(ipAddresses => {
        ipInfo.innerHTML = ipAddresses.join('<br>');
    });

    var coords = distances.map(function(item) {
        return item.coords;
    }).concat([uluruCoords]);
    coords.forEach(function(coord) {
        var dot = L.divIcon({
            className: 'dot',
            html: `<div style="background-color: #ff0000; width: 10px; height: 10px; border-radius: 50%; animation: blink 1s infinite;"> </div>`
        });
        L.marker(coord, { icon: dot }).addTo(map);
    });

    setTimeout(function() {
        location.reload();
    }, 60000);

    window.addEventListener('resize', function() {
        map.invalidateSize();
    });

    setTimeout(function() {
        map.invalidateSize();
    }, 100);
};
