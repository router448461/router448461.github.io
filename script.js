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

            // Fixed coordinates for each IP address
            var ipCoords = [37.7749, -122.4194];
            var dns2Coords = [37.7749, -122.4195];
            var doverCoords = [37.7749, -122.4196];

            var nameServerCoords = [
                [37.7749, -122.4197],
                [37.7749, -122.4198],
                [37.7749, -122.4199],
                [37.7749, -122.4200],
                [37.7749, -122.4201],
                [37.7749, -122.4202],
                [37.7749, -122.4203],
                [37.7749, -122.4204],
                [37.7749, -122.4205],
                [37.7749, -122.4206],
                [37.7749, -122.4207],
                [37.7749, -122.4208]
            ];

            var polyline = L.polyline([], {color: 'white', weight: 1}).addTo(map);

            var latlngs = [ipCoords, dns2Coords].concat(nameServerCoords).concat([doverCoords]);
            var totalDuration = 30000; // 30 seconds
            var steps = 100; // Number of steps for the animation
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
            ipInfo.innerHTML = `IP: ${ip}<br>DNS: ${dns2}<br>NS8: ns8.dynu.com<br>NS9: ns9.dynu.com<br>NS7: ns7.dynu.com<br>NS1: ns1.dynu.com<br>NS5: ns5.dynu.com<br>NS2: ns2.dynu.com<br>NS4: ns4.dynu.com<br>NS3: ns3.dynu.com<br>NS6: ns6.dynu.com<br>NS12: ns12.dynu.com<br>NS10: ns10.dynu.com<br>NS11: ns11.dynu.com`;

            var coords = [ipCoords, dns2Coords].concat(nameServerCoords).concat([doverCoords]);
            coords.forEach(function(coord, index) {
                var dot = L.divIcon({
                    className: 'dot',
                    html: `<div style="background-color: ${index < 2 ? 'green' : 'red'}; width: 1px; height: 1px; border-radius: 50%; animation: blink 1s infinite;"></div>`
                });
                L.marker(coord, { icon: dot }).addTo(map);
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

    lineVertical.style.animation = 'lineMoveVertical 7.5s linear forwards, stayVisible 7.5s linear 7.5s forwards';
    lineHorizontal.style.animation = 'lineMoveHorizontal 7.5s linear forwards, stayVisible 7.5s linear 7.5s forwards';
    lineVerticalBottom.style.animation = 'lineMoveVerticalBottom 7.5s linear forwards, stayVisible 7.5s linear 7.5s forwards';
    lineHorizontalRight.style.animation = 'lineMoveHorizontalRight 7.5s linear forwards, stayVisible 7.5s linear 7.5s forwards';

    setTimeout(function() {
        whiteFlash.style.opacity = 1;
        setTimeout(function() {
            whiteFlash.style.opacity = 0;
        }, 500);
    }, 7500);

    setTimeout(function() {
        whiteFlash.style.opacity = 1;
        setTimeout(function() {
            whiteFlash.style.opacity = 0;
        }, 500);
    }, 30000);

    setTimeout(function() {
        location.reload();
    }, 60000);
};
