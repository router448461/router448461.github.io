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
    }).setView([-33, 151], 2);

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
        [-33.8688, 151.2093], // NS 8.DYNU.COM // AU, SYDNEY
        [1.3521, 103.8198]    // NS 9.DYNU.COM // SG, SINGAPORE
    ];

    var nameServerLocations = [
        'SYDNEY, AU', // NS 8.DYNU.COM
        'SINGAPORE, SP' // NS 9.DYNU.COM
    ];

    function formatIP(ip) {
        return ip;
    }

    function getIP(nameServer) {
        return fetch(`https://dns.google/resolve?name=${nameServer}`)
            .then(response => response.json())
            .then(data => formatIP(data.Answer[0].data))
            .catch(error => console.error('Error:', error));
    }

    Promise.all(nameServers.map(function(nameServer, index) {
        return getIP(nameServer).then(ipAddress => {
            return { ipAddress, index, nameServer, location: nameServerLocations[index] };
        });
    })).then(results => {
        results.forEach(result => {
            var dot = L.divIcon({
                className: 'dot',
                html: `<div style="background-color: #ff0000; width: 10px; height: 10px; border-radius: 50%; animation: blink 1s infinite;"> </div>`
            });
            var marker = L.marker(nameServerCoords[result.index], { icon: dot }).addTo(map);
            marker.bindTooltip(`<span style="color: #ff0000">${result.ipAddress}<br>${nameServerCoords[result.index].join(', ').toUpperCase()}<br>${result.nameServer.toUpperCase()} [${result.location}]</span>`, { permanent: true, direction: "center", className: "myCSSClass" });
        });
    });

    fetch('http://ip-api.com/json/')
        .then(response => response.json())
        .then(data => {
            var visitorInfo = document.createElement('div');
            visitorInfo.style.position = 'absolute';
            visitorInfo.style.top = '10px';
            visitorInfo.style.right = '10px';
            visitorInfo.style.color = '#ff0000';
            visitorInfo.style.zIndex = '1002';
            visitorInfo.innerHTML = `
                IP: ${data.query}<br>
                Coordinates: ${data.lat}, ${data.lon}<br>
                Location: ${data.city.toUpperCase()}, ${data.regionName.toUpperCase()}, ${data.country.toUpperCase()}
            `;
            document.body.appendChild(visitorInfo);
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

