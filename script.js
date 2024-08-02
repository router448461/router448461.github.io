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
            var dns1 = '1.1.1.1'.split('.').map(num => ("000" + num).slice(-3)).join('.');
            var googleDns1 = '8.8.8.8'.split('.').map(num => ("000" + num).slice(-3)).join('.');
            var dns2 = '111.220.1.1'.split('.').map(num => ("000" + num).slice(-3)).join('.');
            displayArea.innerHTML = `<span id="ip-display">${ip}<br>${dns1}<br>${googleDns1}<br>${dns2}</span>`;

            var ipCoords = [37.7749, -122.4194];
            var dns1Coords = [33.6844, -117.8265];
            var googleDns1Coords = [37.3861, -122.0839];
            var dns2Coords = [40.7128, -74.0060];

            var polyline = L.polyline([ipCoords, dns1Coords, ipCoords, googleDns1Coords, ipCoords, dns2Coords], {color: 'red', weight: 1}).addTo(map);

            var counter = 0;
            setInterval(function() {
                counter++;
                var latlngs = [ipCoords, dns1Coords, ipCoords, googleDns1Coords, ipCoords, dns2Coords];
                var newLatLngs = latlngs.slice(0, Math.min(counter, latlngs.length));
                polyline.setLatLngs(newLatLngs);

                var ipDisplay = document.getElementById('ip-display');
                ipDisplay.style.visibility = (counter % 2 === 0) ? 'visible' : 'hidden';
                polyline.setStyle({ opacity: (counter % 2 === 0) ? 1 : 0 });

                var dots = document.getElementsByClassName('flashing-dot');
                for (var i = 0; i < dots.length; i++) {
                    dots[i].style.opacity = (counter % 2 === 0) ? 1 : 0;
                }

                if (counter >= latlngs.length) {
                    counter = 0;
                }
            }, 1000);

            var coords = [ipCoords, dns1Coords, googleDns1Coords, dns2Coords];
            coords.forEach(function(coord) {
                var dot = L.divIcon({
                    className: 'flashing-dot'
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
