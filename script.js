window.onload = function() {
    var displayArea = document.getElementById('display-area');
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
        })
        .catch(error => {
            console.error('Error:', error);
        });

    line.style.animation = 'lineMove 30s linear';
    setTimeout(function() {
        location.reload();
    }, 30000);
};
