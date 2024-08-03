window.onload = function() {
    var map = L.map('map', { zoomControl: false, dragging: false, attributionControl: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false }).setView([0, 0], 3);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: ''
    }).addTo(map);

    map.on('zoomend', function() {
        map.setZoom(3);
    });

    map.scrollWheelZoom.disable();

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            var ip = data.ip.split('.').map(num => ("000" + num).slice(-3)).join(':');
            var dns2 = '111.220.1.1'.split('.').map(num => ("000" + num).slice(-3)).join(':');

            var ipCoords = [37.7749, -122.4194];
            var dns2Coords = [40.7128, -74.0060];
            var doverCoords = [-43.3167, 147.0167]; // Coordinates for Dover, Tasmania

            var polyline = L.polyline([], {color: 'white', weight: 1}).addTo(map);

            var latlngs = [ipCoords, dns2Coords];
            var totalDuration = 30000; // 30 seconds
            var steps = 100; // Number of steps for the animation
            var interval = totalDuration / steps;
            var step = 0;

            var drawLine = setInterval(function() {
                if (step <= steps / 2) {
                    var lat = ipCoords[0] + (dns2Coords[0] - ipCoords[0]) * (step / (steps / 2));
                    var lng = ipCoords[1] + (dns2Coords[1] - ipCoords[1]) * (step / (steps / 2));
                    polyline.addLatLng([lat, lng]);
                    step++;
                } else if (step <= steps) {
                    var lat = dns2Coords[0] + (doverCoords[0] - dns2Coords[0]) * ((step - steps / 2) / (steps / 2));
                    var lng = dns2Coords[1] + (doverCoords[1] - dns2Coords[1]) * ((step - steps / 2) / (steps / 2));
                    polyline.addLatLng([lat, lng]);
                    step++;
                } else {
                    clearInterval(drawLine);
                }
            }, interval);

            var coords = [ipCoords, dns2Coords];
            var ips = [ip, dns2];
            coords.forEach(function(coord, index) {
                var dot = L.divIcon({
                    className: 'dot',
                    html: '<div style="background-color: red; width: 5px; height: 5px; border-radius: 50%; animation: blink 1s infinite;"></div>'
                });
                L.marker(coord, { icon: dot }).addTo(map).bindTooltip(ips[index].split(':').join('<br>'), { permanent: true, direction: 'right', className: 'custom-tooltip' });
            });

            var greenDot = L.divIcon({
                className: 'dot',
                html: '<div style="background-color: green; width: 1px; height: 1px; border-radius: 50%; animation: blink 1s infinite;"></div>'
            });
            L.marker(doverCoords, { icon: greenDot }).addTo(map);
        })
        .catch(error => {
            console.error('Error:', error);
        });

    var lineVertical = document.getElementById('line-vertical');
    var lineHorizontal = document.getElementById('line-horizontal');
    var lineVerticalBottom = document.getElementById('line-vertical-bottom');
    var lineHorizontalRight = document.getElementById('line-horizontal-right');
    var whiteFlash = document.getElementById('white-flash');

    lineVertical.style.animation = 'lineMoveVertical 15s linear forwards';
    lineHorizontal.style.animation = 'lineMoveHorizontal 15s linear forwards';
    lineVerticalBottom.style.animation = 'lineMoveVerticalBottom 15s linear forwards';
    lineHorizontalRight.style.animation = 'lineMoveHorizontalRight 15s linear forwards';

    setTimeout(function() {
        whiteFlash.style.opacity = 1;
        setTimeout(function() {
            whiteFlash.style.opacity = 0;
        }, 500);
    }, 15000);

    setTimeout(function() {
        var lines = [lineVertical, lineHorizontal, lineVerticalBottom, lineHorizontalRight];
        lines.forEach(function(line) {
            line.style.animation = 'moveToDover 15s linear forwards';
        });
    }, 15000);

    setTimeout(function() {
        whiteFlash.style.opacity = 1;
        setTimeout(function() {
            whiteFlash.style.opacity = 0;
            location.reload();
        }, 500);
    }, 30000);

    setTimeout(function() {
        location.reload();
    }, 33000);
};
