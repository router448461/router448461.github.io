window.onload = function() {
    var displayArea = document.getElementById('display-area');
    var repeatCount = 0;

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            displayArea.innerHTML = '' + data.ip;
        })
        .catch(error => {
            console.error('Error:', error);
        });

    setInterval(function() {
        var date = new Date();
        var time = date.getHours() + ":" + date.getMinutes() + ":" + ("0" + date.getSeconds()).slice(-2);
        
        if(repeatCount < 3) {
            displayArea.innerHTML += '<br>' + time;
            repeatCount++;
        } else {
            displayArea.innerHTML = displayArea.innerHTML.split('<br>')[0] + '<br>' + time;
            repeatCount = 1;
            location.reload();
        }
    }, 1000);
};
