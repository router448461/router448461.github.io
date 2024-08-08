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
        'ns8.dynu.com', 'ns9.dynu.com', 'ns7.dynu.com', 'ns1.dynu.com', 'ns5.dynu.com', 'ns2.dynu.com', 'ns4.dynu.com', 'ns3.dynu.com', 'ns6.dynu.com', 'ns12.dynu.com', 'ns10.dynu.com', 'ns11.dynu.com'
    ];

    var nameServerCoords = [
        [51.5074, -0.1278], [48.8566, 2.3522], [52.5200, 13.4050], [34.0522, -118.2437], [35.6895, 139.6917], [55.7558, 37.6173], [40.730610, -73.935242], [39.9042, 116.4074], [28.6139, 77.2090], [37.5665, 126.9780], [31.2304, 121.4737], [22.3964, 114.1095]
    ];

    // Function to calculate the distance between two coordinates using the Haversine formula
    function haversineDistance(coords1, coords2) {
        var R = 6371; // Radius of the Earth in kilometers
        var dLat = (coords2[0] - coords1[0]) * Math.PI / 180;
        var dLng = (coords2[1] - coords1[1]) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(coords1[0] * Math.PI / 180) * Math.cos(coords2[0] * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Calculate distances from Dover to each name server and sort by distance
    var distances = nameServerCoords.map(function(coords, index) {
        return { coords: coords, distance: haversineDistance(doverCoords, coords), nameServer: nameServers[index] };
    });

    distances.sort(function(a, b) {
        return a.distance - b.distance;
    });

    // Create a new latlngs array based on the sorted distances
    var latlngs = [doverCoords].concat(distances.map(function(item) {
        return item.coords;
    })).concat([ipCoords]);

    var polyline = L.polyline([], {color: 'white', weight: 1}).addTo(map);

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
            html: `<div style="background-color: green; width: 10px; height: 10px; border-radius: 50%; animation: blink 1s infinite; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);"> </div>`
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

