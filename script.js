window.onload = async function() {
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

    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
        attribution: '',
        noWrap: false,
        errorTileUrl: 'path/to/fallback-tile.png'
    }).addTo(map);

    tileLayer.on('tileerror', (error, tile) => {
        console.error('Tile loading error:', error);
        console.error('Failed tile:', tile);
    });

    map.on('zoomend', () => {
        map.setZoom(2);
    });

    map.scrollWheelZoom.disable();

    const nameServers = [
        'ns8.dynu.com',
        'ns9.dynu.com',
        'dawn.ns.cloudflare.com'
    ];

    const nameServerCoords = [
        [-33.865143, 151.209900],
        [1.352083, 103.819839],
        [37.7749, -122.4194]
    ];

    const nameServerLocations = [
        'SYDNEY, AU',
        'SINGAPORE, SP',
        'SAN FRANCISCO, US'
    ];

    async function getIP(nameServer) {
        try {
            const response = await fetch(`https://dns.google/resolve?name=${nameServer}`);
            const data = await response.json();
            return { ipAddress: data.Answer[0].data, hostname: nameServer };
        } catch (error) {
            console.error(`Error fetching IP for ${nameServer}:`, error);
            return { ipAddress: 'N/A', hostname: nameServer };
        }
    }

    const results = await Promise.all(nameServers.map(getIP));

    results.forEach((result, index) => {
        const dot = L.divIcon({
            className: 'dot',
            html: `<div style="background-color: var(--military-green); width: 10px; height: 10px; border-radius: 50%; animation: blink 1s infinite;"> </div>`
        });
        const marker = L.marker(nameServerCoords[index], { icon: dot }).addTo(map);
        const tooltipDirection = "right";
        const tooltipContent = `${result.ipAddress}<br>${nameServerCoords[index][0]}<br>${nameServerCoords[index][1]}<br>${result.hostname.toUpperCase()}<br>${nameServerLocations[index]}`;
        marker.bindTooltip(`<span style="color: var(--military-green)">${tooltipContent}</span>`, { permanent: true, direction: tooltipDirection, offset: [10, 0], className: "myCSSClass" });
    });

    try {
        const response = await fetch('https://ip-api.com/json/');
        const data = await response.json();
        const dot = L.divIcon({
            className: 'dot',
            html: `<div style="background-color: var(--military-green); width: 10px; height: 10px; border-radius: 50%; animation: blink 1s infinite;"> </div>`
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

    setTimeout(() => {
        location.reload();
    }, 300000);

    window.addEventListener('resize', () => {
        map.invalidateSize();
    });

    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    setTimeout(() => {
        const flashLayer = document.getElementById('flash-layer');
        flashLayer.style.backgroundColor = '#ffffff';
        flashLayer.style.transition = 'background-color 0.5s ease-in-out';
        setTimeout(() => {
            flashLayer.style.backgroundColor = 'transparent';
        }, 500);
    }, 3000);
};
