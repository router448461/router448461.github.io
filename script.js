window.onload = function() {
    var displayArea = document.getElementById('display-area');

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            displayArea.innerHTML = 'Your IP Address is: ' + data.ip;
        })
        .catch(error => {
            console.error('Error:', error);
        });
};
