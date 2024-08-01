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
            var addresses = [ip, dns1, dns2, googleDns1, googleDns2];

            // Example coordinates for IP and DNS servers
            // You will need to replace the example coordinates with the actual coordinates of the IP address and DNS servers.
            var ipCoords = [37.7749, -122.4194]; // Replace with actual IP coordinates
            var dns1Coords = [33.6844, -117.8265]; // Replace with actual DNS1 coordinates
            var dns2Coords = [40.7128, -74.0060]; // Replace with actual DNS2 coordinates
            var googleDns1Coords = [37.3861, -122.0839]; // Replace with actual Google DNS1 coordinates
            var googleDns2Coords = [37.3861, -122.0839]; // Replace with actual Google DNS2 coordinates

            var polyline = L.polyline([ipCoords, dns1Coords, ipCoords, dns2Coords, ipCoords, googleDns1Coords, ipCoords, googleDns2Coords], {color: 'red'}).addTo(map);

            var counter = 0;
            setInterval(function() {
                var latlngs = [ipCoords, dns1Coords, ipCoords, dns2Coords, ipCoords, googleDns1Coords, ipCoords, googleDns2Coords];
                var newLatLngs = latlngs.slice(0, Math.min(counter + 1, latlngs.length));
                polyline.setLatLngs(newLatLngs);

                // Flash IP address and traceroute line
                var ipDisplay = document.getElementById('ip-display');
                ipDisplay.style.visibility = (counter % 2 === 0) ? 'visible' : 'hidden';
                polyline.setStyle({ opacity: (counter % 2 === 0) ? 1 : 0 });

                // Flash green dots
                var dots = document.getElementsByClassName('flashing-dot');
                for (var i = 0; i < dots.length; i++) {
                    dots[i].style.opacity = (counter % 2 === 0) ? 1 : 0;
                }

                // Display each address sequentially
                if (counter % 2 === 0) {
                    var displayText = addresses[Math.floor(counter / 2)] + '<br>';
                    displayArea.innerHTML = `<span id="ip-display">${displayText}</span>`;
                }

                counter++;
                if (counter >= latlngs.length * 2) {
                    counter = 0;
                }
            }, 1000);

            // Add flashing green dots for IP and DNS coordinates
            var coords = [ipCoords, dns1Coords, dns2Coords, googleDns1Coords, googleDns2Coords];
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
