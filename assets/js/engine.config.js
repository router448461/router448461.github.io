(() => {
  const { util } = window.engine;

  window.engine.config = {
    // Visual palette
    background: {
      top: "rgba(0,0,0,1)",
      bottom: "rgba(8,16,24,0.6)",     // subtle wash
      vignette: "rgba(0,0,0,0.35)"
    },
    color: "#84c5ff",                   // particle core tint
    linkColor: "#84c5ff",
    linkOpacity: 0.45,
    linkDistance: 140,                  // default, can adapt with FPS

    // Particles
    baseParticleDensity: 0.00008,       // per pixel
    maxParticles: 180,
    particleSize: [0.9, 2.2],
    speed: [0.05, 0.35],                // pixel/frame at 60fps baseline

    // Interaction
    repelRadius: 90,
    repelStrength: 0.6,                 // softened repel
    settleFactor: 0.035,                // inertia ripple toward base vector

    // Earth symbol
    earth: {
      glyph: "⏚",
      radius: 32,                       // hit radius in CSS px
      font: "700 42px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      pulse: { min: 0.35, max: 0.85, speed: 0.9 }
    },

    // Link glow
    glow: {
      linkShadowBlur: 6,
      particleShadowBlur: 8,
      strengthNear: 1.0
    },

    // FPS adaptation
    fpsAdaptive: {
      low: 45,                          // below -> reduce load
      high: 58,                         // above -> recover toward target
      particleStep: 6,                  // how many to add/remove per second
      linkStep: 6,                      // px per second change
      minParticles: 80,
      minLinkDistance: 90
    }
  };
})();
