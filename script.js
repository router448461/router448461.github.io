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

    // Function to sync the blink animation with the clock
    function syncBlink() {
        // Get the current time
        var date = new Date();
        var seconds = date.getSeconds();

        // Calculate the animation delay
        var delay = (60 - seconds) % 2;

        // Apply the animation delay to the elements
        cursor.style.animationDelay = delay + 's';
        displayArea.style.animationDelay = delay + 's';
    }

    // Call the function when the page loads
    syncBlink();

    // Call the function every second thereafter
    setInterval(syncBlink, 1000);
};
