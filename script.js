window.onload = function() {
    fetch('https://your-api-url-here')
        .then(response => response.json())
        .then(data => {
            document.getElementById('ip1').innerHTML = 
                `IPv4 for router448461.com: <br> <span style="color:red">${data.ipv4}</span><br>` +
                `IPv6 for router448461.com: <br> <span style="color:red">${data.ipv6}</span>`;
        })
        .catch(error => console.error('Error:', error));

    fetch('https://your-api-url-here')
        .then(response => response.json())
        .then(data => {
            document.getElementById('ip2').innerHTML = 
                `IPv4 for bonjour.router448461.com: <br> <span style="color:red">${data.ipv4}</span><br>` +
                `IPv6 for bonjour.router448461.com: <br> <span style="color:red">${data.ipv6}</span>`;
        })
        .catch(error => console.error('Error:', error));
}
