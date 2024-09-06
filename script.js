window.onload = async function() {
    // Initialize the map
    const map = L.map('map', {
        zoomControl: false,
        dragging: false,
        attributionControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        worldCopyJump: true,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0,
        touchZoom: false,
    }).setView([0, 0], 2);

    // Add tile layer to the map
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
        attribution: '',
        noWrap: false,
        errorTileUrl: 'path/to/fallback-tile.png'
    }).addTo(map);

    // Handle tile loading errors
    tileLayer.on('tileerror', (error, tile) => {
        console.error('Tile loading error:', error);
        console.error('Failed tile:', tile);
    });

    // Prevent zooming
    map.on('zoomend', () => {
        map.setZoom(2);
    });

    // Disable scroll wheel zoom
    map.scrollWheelZoom.disable();

    // Name servers and their coordinates
    const nameServers = [
        'nc1.dns.oss-core.net',
        'ns8.dynu.com',
        'ns9.dynu.com',
        'dawn.ns.cloudflare.com',
        'peter.ns.cloudflare.com'
    ];

    const nameServerCoords = [
        [-33.865143, 151.209900],
        [-33.865143, 151.209900],
        [1.352083, 103.819839],
        [37.7749, -122.4194],
        [51.5074, -0.1278]
    ];

    const nameServerLocations = [
        'SYDNEY, AU',
        'SYDNEY, AU',
        'SINGAPORE, SP',
        'SAN FRANCISCO, US',
        'LONDON, UK'
    ];

    // Function to get IP address of a name server
    async function getIP(nameServer) {
        if (nameServer === '111.220.1.1') {
            return { ipAddress: nameServer, hostname: 'nc1.dns.oss-core.net' };
        } else if (nameServer === 'dawn.ns.cloudflare.com') {
            return { ipAddress: '173.245.58.106', hostname: nameServer };
        } else if (nameServer === 'peter.ns.cloudflare.com') {
            return { ipAddress: '173.245.59.136', hostname: nameServer };
        }

        try {
            const response = await fetch(`https://dns.google/resolve?name=${nameServer}`);
            const data = await response.json();
            return { ipAddress: data.Answer[0].data, hostname: nameServer };
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Get IP addresses for all name servers
    const results = await Promise.all(nameServers.map(async (nameServer, index) => {
        const result = await getIP(nameServer);
        return { ...result, index, location: nameServerLocations[index] };
    }));

    // Add markers for name servers
    results.forEach(result => {
        const dot = L.divIcon({
            className: 'dot',
            html: `<div style="background-color: #ff0000; width: 10px; height: 10px; border-radius: 50%; animation: blink 1s infinite;"> </div>`
        });
        const marker = L.marker(nameServerCoords[result.index], { icon: dot }).addTo(map);
        const tooltipDirection = result.hostname === 'nc1.dns.oss-core.net' ? "left" : "right";
        const tooltipContent = `${result.ipAddress}<br>${nameServerCoords[result.index][0]}<br>${nameServerCoords[result.index][1]}<br>${result.hostname.toUpperCase()}<br>${result.location}`;
        marker.bindTooltip(`<span style="color: #ff0000">${tooltipContent}</span>`, { permanent: true, direction: tooltipDirection, offset: [10, 0], className: "myCSSClass" });
    });

    // Get visitor's IP information and add marker
    try {
        const response = await fetch('http://ip-api.com/json/');
        const data = await response.json();
        const dot = L.divIcon({
            className: 'dot',
            html: `<div style="background-color: var(--military-green); width: 10px; height: 10px; border-radius: 50%; animation: blink 1ms infinite;"> </div>`
        });
        const marker = L.marker([data.lat, data.lon], { icon: dot }).addTo(map);

        const visitorInfo = document.createElement('div');
        visitorInfo.id = 'visitor-info';
        visitorInfo.innerHTML = `${data.query}<br>${data.lat}<br>${data.lon}<br>${data.as}<br>${data.city}, ${data.regionName}, ${data.country}`;
        document.getElementById('map').appendChild(visitorInfo);

        const dnsResponse = await fetch(`https://dns.google/resolve?name=${data.query}`);
        const dnsData = await dnsResponse.json();
        visitorInfo.innerHTML = `${dnsData.Answer[0].data}<br>${data.lat}<br>${data.lon}<br>${data.as}<br>${data.city}, ${data.regionName}, ${data.country}`;
    } catch (error) {
        console.error('Error:', error);
    }

    // Reload the page every 5 minutes
    setTimeout(() => {
        location.reload();
    }, 300000);

    // Adjust map size on window resize
    window.addEventListener('resize', () => {
        map.invalidateSize();
    });

    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    // Flash effect on page load
    setTimeout(() => {
        const flashLayer = document.getElementById('flash-layer');
        flashLayer.style.backgroundColor = '#ffffff';
        flashLayer.style.transition = 'background-color 0.5s ease-in-out';
        setTimeout(() => {
            flashLayer.style.backgroundColor = 'transparent';
        }, 500);
    }, 3000);
};
