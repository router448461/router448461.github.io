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
            .then(data => {
                var ipAddress = formatIP(data.Answer[0].data);
                // Use a geolocation API to get the coordinates from the IP address
                return fetch(`https://freegeoip.app/json/${ipAddress}`)
                    .then(response => response.json())
                    .then(geoData => {
                        return {
                            ipAddress,
                            latitude: geoData.latitude,
                            longitude: geoData.longitude
                        };
                    });
            })
            .catch(error => console.error('Error:', error));
    }

    Promise.all(nameServers.map(function(nameServer, index) {
        return getIP(nameServer).then(ipData => {
            return { 
                ipAddress: ipData.ipAddress, 
                latitude: ipData.latitude, 
                longitude: ipData.longitude, 
                nameServer, 
                location: nameServerLocations[index] 
            };
        });
    })).then(results => {
        results.forEach(result => {
            var dot = L.divIcon({
                className: 'dot',
                html: `<div style="background-color: #ff0000; width: 10px; height: 10px; border-radius: 50%; animation: blink 1s infinite;"> </div>`,
                iconAnchor: [10, 0]  // Adjust the x-coordinate of the icon's tip
            });
            var marker = L.marker([result.latitude, result.longitude], { icon: dot }).addTo(map);
            marker.bindTooltip(`<span style="color: #ff0000">${result.ipAddress}<br>Lat: ${result.latitude}<br>Long: ${result.longitude}<br>${result.nameServer.toUpperCase()}<br>[${result.location}]</span>`, { permanent: true, direction: "center", className: "myCSSClass" });
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
