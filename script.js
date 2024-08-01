window.onload = function() {
    var displayArea = document.getElementById('display-area');
    var map = L.map('map', { zoomControl: false, dragging: false, attributionControl: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false }).setView([0, 0], 3);

    // Use a dark mode tile layer with no labels
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: ''
    }).addTo(map);

    map.on('zoomend', function() {
        map.setZoom(3);
    });

    // Disable mouse wheel scroll
    map.scrollWheelZoom.disable();

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            var ip = data.ip.split('.').map(num => ("000" + num).slice(-3)).join('.');
            var dns1 = '1.1.1.3'.split('.').map(num => ("000" + num).slice(-3)).join('.');
            var dns2 = '1.0.0.3'.split('.').map(num => ("000" + num).slice(-3)).join('.');
            var googleDns1 = '8.8.8.8'.split('.').map(num => ("000" + num).slice(-3)).join('.');
            var googleDns2 = '8.8.4.4'.split('.').map(num => ("000" + num).slice(-3)).join('.');
            displayArea.innerHTML = `<span id="ip-display">${ip}<br>${dns1}<br>${dns2}<br>${googleDns1}<br>${googleDns2}</span>`;

            // Example coordinates for IP and DNS servers
            // You will need to replace the example coordinates with the actual coordinates of the IP address and DNS servers.
            var ipCoords = [37.7749, -122.4194]; // Replace with actual IP coordinates
            var dns1Coords = [33.6844, -117.8265]; // Replace with actual DNS1 coordinates
            var dns2Coords = [40.7128, -74.0060]; // Replace with actual DNS2 coordinates
            var googleDns1Coords = [37.3861, -122.0839]; // Replace with actual Google DNS1 coordinates
            var googleDns2Coords = [37.3861, -122.0839]; // Replace with actual Google DNS2 coordinates

            var polyline = L.polyline([], {color: 'red'}).addTo(map);

            var latlngs = [ipCoords, dns1Coords, ipCoords, dns2Coords, ipCoords, googleDns1Coords, ipCoords, googleDns2Coords];
            var counter = 0;
            var interval = 30000 / latlngs.length; // Calculate interval based on 30 seconds

            var drawInterval = setInterval(function() {
                if (counter < latlngs.length) {
                    var newLatLngs = latlngs.slice(0, counter + 1);
                    polyline.setLatLngs(newLatLngs);
                    counter++;
                } else {
                    clearInterval(drawInterval);
                }
            }, interval);
        })
        .catch(error => {
            console.error('Error:', error);
        });

    var lineVertical = document.getElementById('line-vertical');
    lineVertical.style.animation = 'lineMoveVertical 15s linear'; // Changed duration to 15s
    var lineHorizontal = document.getElementById('line-horizontal');
    lineHorizontal.style.animation = 'lineMoveHorizontal 15s linear'; // Changed duration to 15s
    setTimeout(function() {
        location.reload();
    }, 30000);

    // Flash the screen white at 15 seconds
    var whiteFlash = document.getElementById('white-flash');
    setTimeout(function() {
        whiteFlash.style.opacity = 1;
        setTimeout(function() {
            whiteFlash.style.opacity = 0;
        }, 500); // Flash duration
    }, 15000); // Flash at 15 seconds
};
