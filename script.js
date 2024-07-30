window.onload = function() {
    var cursor = document.getElementById('cursor');
    cursor.innerHTML = '|'; // This is the cursor character

    var displayArea = document.getElementById('display-area');

    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            displayArea.innerHTML = '' + data.ip;
        })
        .catch(error => {
            console.error('Error:', error);
        });
};
