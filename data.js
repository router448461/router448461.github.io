// Function to fetch data dynamically from both ArcGIS datasets
async function fetchMilitaryBases() {
    const mirtaUrl =
        'https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Military_Installations_Ranges_and_Training_Areas_MIRTA_DOD_Sites_Boundaries/FeatureServer/0/query?where=1%3D1&outFields=Name,Latitude,Longitude&outSR=4326&f=json';
    const basesUrl =
        'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/MilitaryBases/FeatureServer/0/query?where=1%3D1&outFields=Name,Latitude,Longitude&outSR=4326&f=json';

    try {
        // Fetch data from MIRTA API
        const mirtaResponse = await fetch(mirtaUrl);
        const mirtaData = await mirtaResponse.json();

        // Fetch data from Military Bases API
        const basesResponse = await fetch(basesUrl);
        const basesData = await basesResponse.json();

        // Combine and normalize data
        const combinedData = [
            ...mirtaData.features.map((feature) => ({
                name: feature.attributes.Name || 'Unnamed Base',
                lat: feature.geometry.y,
                lon: feature.geometry.x,
            })),
            ...basesData.features.map((feature) => ({
                name: feature.attributes.Name || 'Unnamed Base',
                lat: feature.geometry.y,
                lon: feature.geometry.x,
            })),
        ];

        return combinedData; // Return the normalized list of military bases
    } catch (error) {
        console.error('Failed to fetch military base data:', error);
        return []; // Return an empty array if there's an API error
    }
}

// Example export to use this function in other files
export { fetchMilitaryBases };
