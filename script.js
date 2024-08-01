window.onload = function() {
    var displayArea = document.getElementById('display-area');
    var map = L.map('map', { zoomControl: false, dragging: false }).setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var line = document.createElement('div');
    line.id = 'line';
    document.body.appendChild(line);

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            var ip = data.ip.split('.').map(num => ("000" + num).slice(-3)).join('.');
            var dns1 = '1.1.1.3'.split('.').map(num => ("000" + num).slice(-3)).join('.');
            var dns2 = '1.0.0.3'.split('.').map(num => ("000" + num).slice(-3)).join('.');
            displayArea.innerHTML = ip + '<br>' + dns1 + '<br>' + dns2;

            // Example coordinates for IP and DNS servers
            // You will need to replace the example coordinates with the actual coordinates of the IP address and DNS servers.
            var ipCoords = [37.7749, -122.4194]; // Replace with actual IP coordinates
            var dns1Coords = [33.6844, -117.8265]; // Replace with actual DNS1 coordinates
            var dns2Coords = [40.7128, -74.0060]; // Replace with actual DNS2 coordinates

            var polyline = L.polyline([ipCoords, dns1Coords, ipCoords, dns2Coords], {color: 'red'}).addTo(map);

            var counter = 0;
            setInterval(function() {
                counter++;
                var latlngs = polyline.getLatLngs();
                var newLatLngs = latlngs.slice(0, Math.min(counter, latlngs.length));
                polyline.setLatLngs(newLatLngs);
            }, 1000);
        })
        .catch(error => {
            console.error('Error:', error);
        });

    line.style.animation = 'lineMove 30s linear';
    setTimeout(function() {
        location.reload();
    }, 30000);
};
