fetch('https://api64.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        document.getElementById('ip1').innerHTML = 
            `IP for router448461.com: <br> <span style="color:red">${data.ip}</span>`;
    })
    .catch(error => console.error('Error:', error));

fetch('https://api64.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        document.getElementById('ip2').innerHTML = 
            `IP for bonjour.router448461.com: <br> <span style="color:red">${data.ip}</span>`;
    })
    .catch(error => console.error('Error:', error));
