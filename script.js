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
        [34.0522, -118.2437], 
        [33.4484, -112.0740], 
        [33.7490, -84.3880],  
        [32.7767, -96.7970],  
        [47.6062, -122.3321], 
        [40.0583, -74.4057],  
        [35.6895, 139.6917],  
        [-33.8688, 151.2093], 
        [1.3521, 103.8198],   
        [52.3676, 4.9041],    
        [50.1109, 8.6821],    
        [51.5074, -0.1278]    
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

    var latlngs = [uluruCoords].concat(distances.map(function(item) {
        return item.coords;
    })).concat([uluruCoords]);

    var polyline = L.polyline([], {color: '#ffffff', weight: 1}).addTo(map);

    var totalDuration = 3000;
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

    var coords = [uluruCoords].concat(distances.map(function(item) {
        return item.coords;
    })).concat([uluruCoords]);
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
