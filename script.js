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
        'ns8.dynu.com', // AU, SYDNEY
        'ns9.dynu.com'  // SG, SINGAPORE
    ];

    var nameServerCoords = [
        [-33.0000, 151.0000], // NS 8.DYNU.COM // AU, SYDNEY
        [1.0000, 103.0000]    // NS 9.DYNU.COM // SG, SINGAPORE
    ];

    function formatIP(ip) {
        return ip.split('.').map(num => num.padStart(3, '0')).join('.');
    }

    function getIP(nameServer) {
        return fetch(`https://dns.google/resolve?name=${nameServer}`)
            .then(response => response.json())
            .then(data => formatIP(data.Answer[0].data))
            .catch(error => console.error('Error:', error));
    }

    Promise.all(nameServers.map(function(nameServer, index) {
        return getIP(nameServer).then(ipAddress => {
            return { ipAddress, index, nameServer };
        });
    })).then(results => {
        results.forEach(result => {
            var dot = L.divIcon({
                className: 'dot',
                html: `<div style="background-color: #ff0000; width: 10px; height: 10px; border-radius: 50%; animation: blink 1s infinite;"> </div>`
            });
            L.marker(nameServerCoords[result.index], { icon: dot })
                .bindTooltip(`<span style="color: #ff0000">${result.ipAddress}<br>${nameServerCoords[result.index].join(', ')}<br>${result.nameServer}</span>`, { permanent: false })
                .addTo(map);
        });
    });

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
