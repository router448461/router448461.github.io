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
        'dawn.ns.cloudflare.com',
        'peter.ns.cloudflare.com',
        '61.9.188.33', // Telstra Primary DNS Tasmania
        '61.9.134.49'  // Telstra Secondary DNS Tasmania
    ];

    const nameServerCoords = [
        [-33.865143, 151.209900],
        [1.352083, 103.819839],
        [37.7749, -122.4194],
        [51.5074, -0.1278],
        [-42.8821, 147.3272], // Coordinates for Telstra Primary DNS Tasmania
        [-42.8821, 147.3272]  // Coordinates for Telstra Secondary DNS Tasmania
    ];

    const nameServerLocations = [
        'SYDNEY, AU',
        'SINGAPORE, SP',
        'SAN FRANCISCO, US',
        'LONDON, UK',
        'HOBART, TAS',
        'HOBART, TAS'
    ];

    async function getIP(nameServer) {
        if (nameServer === 'dawn.ns.cloudflare.com') {
            return { ipAddress: '173.245.58.106', hostname: nameServer };
        } else if (nameServer === 'peter.ns.cloudflare.com') {
            return { ipAddress: '173.245.59.136', hostname: nameServer };
        } else if (nameServer === '61.9.188.33') {
            return { ipAddress: '61.9.188.33', hostname: 'telstra-primary-dns-tasmania' };
        } else if (nameServer === '61.9.134.49') {
            return { ipAddress: '61.9.134.49', hostname: 'telstra-secondary-dns-tasmania' };
        }

        try {
            const response = await fetch(`https://dns.google/resolve?name=${nameServer}`);
            const data = await response.json();
            return { ipAddress: data.Answer[0].data, hostname: nameServer };
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const results = await Promise.all(nameServers.map(async (nameServer, index) => {
        const result = await getIP(nameServer);
        return { ...result, index, location: nameServerLocations[index] };
    }));

    results.forEach(result => {
        const dot = L.divIcon({
            className: 'dot',
            html: `<div style="background-color: #ff0000; width: 10px; height: 10px; border-radius: 50%;"></div>`
        });
        const marker = L.marker(nameServerCoords[result.index], { icon: dot }).addTo(map);
        const tooltipDirection = "right";
        const tooltipContent = `${result.ipAddress}<br>${nameServerCoords[result.index][0]}<br>${nameServerCoords[result.index][1]}<br>${result.hostname.toUpperCase()}<br>${result.location}`;
        marker.bindTooltip(`<span style="color: #ff0000">${tooltipContent}</span>`, { permanent: true, direction: tooltipDirection, offset: [10, 0], className: "myCSSClass" });
    });

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
