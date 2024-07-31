window.onload = function() {
    var displayArea = document.getElementById('display-area');
    var locationArea = document.getElementById('location-area');

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            displayArea.innerHTML = '' + data.ip;
        })
        .catch(error => {
            console.error('Error:', error);
        });

    navigator.geolocation.getCurrentPosition(function(position) {
        locationArea.innerHTML = '' + position.coords.longitude + '<br>' + position.coords.latitude;
    });
};
