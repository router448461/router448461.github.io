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
            var hobartCoords = [-42.8821, 147.3272];

            var polyline = L.polyline([], {color: 'white', weight: 1}).addTo(map);

            var latlngs = [ipCoords, dns2Coords];
            var totalDuration = 15000; // 15 seconds
            var steps = 100; // Number of steps for the animation
            var interval = totalDuration / steps;
            var step = 0;

            var drawLine = setInterval(function() {
                if (step <= steps) {
                    var lat = ipCoords[0] + (dns2Coords[0] - ipCoords[0]) * (step / steps);
                    var lng = ipCoords[1] + (dns2Coords[1] - ipCoords[1]) * (step / steps);
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
                    html: '<div style="background-color: red; width: 5px; height: 5px; border-radius: 50%;"></div>'
                });
                L.marker(coord, { icon: dot }).addTo(map).bindTooltip(ips[index].split(':').join('<br>'), { permanent: true, direction: 'right', className: 'custom-tooltip' });
            });

            var hobartMarker = L.divIcon({
                className: 'dot',
                html: '<div style="background-color: green; width: 5px; height: 5px; border-radius: 50%;"></div>'
            });
            L.marker(hobartCoords, { icon: hobartMarker }).addTo(map);

            setInterval(function() {
                hobartMarker.options.html = hobartMarker.options.html.includes('opacity: 1') ? hobartMarker.options.html.replace('opacity: 1', 'opacity: 0') : hobartMarker.options.html.replace('opacity: 0', 'opacity: 1');
                L.marker(hobartCoords, { icon: hobartMarker }).addTo(map);
            }, 1000);
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
        location.reload();
    }, 30000);
};
