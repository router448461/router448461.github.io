const config = {
  particleCount: 80,
  trailAlpha: 0.1,          // lower = longer trails
  lineMaxDist: 120,         // connect threshold
  gridCellSize: 100,        // for spatial partitioning

  // noise-based turbulence
  turbulenceStrength: 0.0005,

  // gentle central pull (no collapse)
  centralPull: 0.0001,

  // Brownian jitter
  jitterStrength: 0.05,

  // layered parallax settings
  layers: [
    { speedMult: 0.5, size: 1, color: 'rgba(0,255,128,0.4)' },
    { speedMult: 1.0, size: 1.5, color: 'rgba(0,255,128,0.6)' },
    { speedMult: 1.5, size: 2, color: 'rgba(0,255,128,0.8)' }
  ]
};

export default config;
