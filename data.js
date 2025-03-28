// Function to fetch data dynamically from both ArcGIS datasets
async function fetchMilitaryBases() {
    const mirtaUrl =
        'https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Military_Installations_Ranges_and_Training_Areas_MIRTA_DOD_Sites_Boundaries/FeatureServer/0/query?where=1%3D1&outFields=Name,Latitude,Longitude&outSR=4326&f=json';
    const basesUrl =
        'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/MilitaryBases/FeatureServer/0/query?where=1%3D1&outFields=Name,Latitude,Longitude&outSR=4326&f=json';

    try {
        const response1 = await fetch(mirtaUrl);
        const data1 = await response1.json();

        const response2 = await fetch(basesUrl);
        const data2 = await response2.json();

        const features = [
            ...data1.features.map(feature => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [feature.geometry.x, feature.geometry.y] },
                properties: { name: feature.attributes.Name || 'Unnamed Base' }
            })),
            ...data2.features.map(feature => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [feature.geometry.x, feature.geometry.y] },
                properties: { name: feature.attributes.Name || 'Unnamed Base' }
            }))
        ];

        return { type: 'FeatureCollection', features };
    } catch (error) {
        console.error('Failed to fetch military base data:', error);
        return { type: 'FeatureCollection', features: [] }; // Empty GeoJSON
    }
}

export { fetchMilitaryBases };
