window.onload = function() {
    var displayArea = document.getElementById('display-area');

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            displayArea.innerHTML = 'IP: ' + data.ip;
        })
        .catch(error => {
            console.error('Error:', error);
        });

    setInterval(function() {
        var date = new Date();
        var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        displayArea.innerHTML += '<br>Time: ' + time;
    }, 1000);
};
