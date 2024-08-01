window.onload = function() {
    var displayArea = document.getElementById('display-area');
    var locationArea = document.getElementById('location-area');
    var line = document.createElement('div');
    line.id = 'line';
    document.body.appendChild(line);

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            var ip = data.ip.split('.').map(num => ("000" + num).slice(-3)).join('.');
            displayArea.innerHTML = ip;
        })
        .catch(error => {
            console.error('Error:', error);
        });

    var counter = 0;
    setInterval(function() {
        counter++;
        var dots = '.'.repeat(counter % 3 + 1);
        locationArea.innerHTML = 'connected' + dots;

        line.style.animation = 'lineMove 30s linear';

        if (counter % 3 === 0) {
            location.reload();
        }
    }, 10000);
};
