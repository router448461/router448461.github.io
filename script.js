fetch('https://api64.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        document.getElementById('ip').innerHTML = 
            `IP for router448461.com and bonjour.router448461.com: <br> <span style="color:red">${data.ip}</span>`;
    })
    .catch(error => console.error('Error:', error));
