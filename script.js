window.onload = function() {
    var displayArea = document.getElementById('display-area');
    var repeatCount = 0;

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
        var date = new Date();
        var hours = ("000" + date.getHours()).slice(-3);
        var minutes = ("000" + date.getMinutes()).slice(-3);
        var seconds = ("000" + date.getSeconds()).slice(-3);
        var milliseconds = ("000" + date.getMilliseconds()).slice(-3);
        var time = hours + ":" + minutes + ":" + seconds + ":" + milliseconds;
        
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
