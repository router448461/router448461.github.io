window.onload = function() {
    var map = L.map('map', { zoomControl: false, dragging: false, attributionControl: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false }).setView([0, 0], 3);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: ''
    }).addTo(map);

    map.on('zoomend', function() {
        map.setZoom(3);
    });

    map.scrollWheelZoom.disable();

    var doverCoords = [-43.3167, 147.0167]; // Coordinates for Dover, Tasmania

    var polyline = L.polyline([], {color: 'white', weight: 1}).addTo(map);

    var totalDuration = 30000; // 30 seconds
    var steps = 100; // Number of steps for the animation
    var interval = totalDuration / steps;
    var step = 0;

    var drawLine = setInterval(function() {
        if (step <= steps / 2) {
            var lat = 0 + (doverCoords[0] - 0) * (step / (steps / 2));
            var lng = 0 + (doverCoords[1] - 0) * (step / (steps / 2));
            polyline.addLatLng([lat, lng]);
            step++;
        } else if (step <= steps) {
            var lat = doverCoords[0];
            var lng = doverCoords[1];
            polyline.addLatLng([lat, lng]);
            step++;
        } else {
            clearInterval(drawLine);
        }
    }, interval);

    var greenDot = L.divIcon({
        className: 'dot',
        html: '<div style="background-color: green; width: 1px; height: 1px; border-radius: 50%; animation: blink 1s infinite;"></div>'
    });
    L.marker(doverCoords, { icon: greenDot }).addTo(map);

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
