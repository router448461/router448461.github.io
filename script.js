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

    setInterval(function() {
        locationArea.style.fontSize = '12px';
        locationArea.style.animation = 'blink 1s infinite';
        locationArea.innerHTML = 'Connected';

        // Start the line animation
        line.style.animation = 'lineMove 1s linear';
        
        // Reload the page after the animation
        setTimeout(function() {
            location.reload();
        }, 1000);
    }, 1000);
};
