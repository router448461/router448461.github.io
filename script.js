// Replace with your own MapKit JS credentials
const MAPKIT_TOKEN = "YOUR_JWT_TOKEN_HERE";
const MAPKIT_KEY_ID = "YOUR_KEY_ID_HERE";

mapkit.init({
  authorizationCallback: done => {
    // fetch or inline your JWT; here we use a placeholder:
    done(MAPKIT_TOKEN);
  }
});

// Create the map in “flat” or “mutedStandard” style
const map = new mapkit.Map("map", {
  showsPointsOfInterest: false,
  showsBuildings: false,
  mapType: mapkit.Map.MapTypes.MutedStandard,
  center: new mapkit.Coordinate(20, 0),
  zoomLevel: 1.2
});

console.log("🔥 World-on-Fire map initialized.");
