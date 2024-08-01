window.onload = function() {
    var displayArea = document.getElementById('display-area');
    var locationArea = document.getElementById('location-area');

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
    }, 1000);
};
