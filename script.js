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
    }).setView([20, 0], 2);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '',
        noWrap: true
    }).addTo(map);

    map.on('zoomend', function() {
        map.setZoom(2);
    });

    map.scrollWheelZoom.disable();

    var ipCoords = [37.7749, -122.4194];
    var doverCoords = [-43.3167, 147.0167];

    var nameServers = [
        'ns1.dynu.com', 'ns2.dynu.com', 'ns3.dynu.com', 'ns4.dynu.com', 'ns5.dynu.com', 'ns6.dynu.com', 'ns7.dynu.com', 'ns8.dynu.com', 'ns9.dynu.com', 'ns10.dynu.com', 'ns11.dynu.com', 'ns12.dynu.com'
    ];

    var nameServerCoords = [
        [34.0522, -118.2437], // ns1.dynu.com (Los Angeles, US)
        [33.4484, -112.0740], // ns2.dynu.com (Phoenix, US)
        [33.7490, -84.3880],  // ns3.dynu.com (Atlanta, US)
        [32.7767, -96.7970],  // ns4.dynu.com (Dallas, US)
        [47.6062, -122.3321], // ns5.dynu.com (Seattle, US)
        [40.0583, -74.4057],  // ns6.dynu.com (New Jersey, US)
        [35.6895, 139.6917],  // ns7.dynu.com (Tokyo, JP)
        [-33.8688, 151.2093], // ns8.dynu.com (Sydney, AU)
        [1.3521, 103.8198],   // ns9.dynu.com (Singapore, SG)
        [52.3676, 4.9041],    // ns10.dynu.com (Amsterdam, NL)
        [50.1109, 8.6821],    // ns11.dynu.com (Frankfurt, DE)
        [51.5074, -0.1278]    // ns12.dynu.com (London, UK)
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
        return { coords: coords, distance: haversineDistance(doverCoords, coords), nameServer: nameServers[index] };
    });

    distances.sort(function(a, b) {
        return a.distance - b.distance;
    });

    var latlngs = [doverCoords].concat(distances.map(function(item) {
        return item.coords;
    })).concat([ipCoords]);

    var polyline = L.polyline([], {color: 'white', weight: 3}).addTo(map);

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
            }
            step++;
        } else {
            clearInterval(drawLine);
        }
    }, interval);

    var ipInfo = document.getElementById('ip-info');
    ipInfo.style.color = 'green';
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

    var coords = [doverCoords].concat(distances.map(function(item) {
        return item.coords;
    })).concat([ipCoords]);
    coords.forEach(function(coord) {
        var dot = L.divIcon({
            className: 'dot',
            html: `<div style="background-color: green; width: 13px; height: 13px; border-radius: 50%; animation: blink 1s infinite;"> </div>`
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

    setTimeout(function() {
        console.log('Flash triggered');
        document.getElementById('flash').classList.add('flash-white');
    }, 30000);
};
