window.onload = function() {
    var displayArea = document.getElementById('display-area');
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
            var ip = data.ip.split('.').map(num => ("000" + num).slice(-3)).join('.');
            var dns2 = '111.220.1.1'.split('.').map(num => ("000" + num).slice(-3)).join('.');
            displayArea.innerHTML = `<span id="ip-display" style="color: yellow;">${ip}<br>${dns2}</span>`;

            var ipCoords = [37.7749, -122.4194];
            var dns2Coords = [40.7128, -74.0060];

            var polyline = L.polyline([], {color: 'red', weight: 1}).addTo(map);

            var latlngs = [ipCoords, dns2Coords];
            var totalDuration = 15000; // 15 seconds
            var interval = totalDuration / latlngs.length;
            var counter = 0;

            var drawLine = setInterval(function() {
                if (counter < latlngs.length) {
                    polyline.addLatLng(latlngs[counter]);
                    counter++;
                } else {
                    clearInterval(drawLine);
                }
            }, interval);

            var coords = [ipCoords, dns2Coords];
            coords.forEach(function(coord) {
                var dot = L.divIcon({
                    className: 'flashing-dot',
                    html: '<div style="background-color: yellow; width: 2px; height: 2px; border-radius: 50%;"></div>'
                });
                L.marker(coord, { icon: dot }).addTo(map);
            });
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
