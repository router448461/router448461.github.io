/* global window */
(function attachConfig(global) {
  'use strict';

  // All tunables in one place; tweak to taste.
  const BG_CONFIG = {
    // Canvas/device
    maxDevicePixelRatio: 2, // clamp DPR for perf + crispness
    pauseWhenHidden: true,

    // Palette (no glow/pulse)
    colors: {
      background: '#0a0a0c',
      gridMinor: '#121216',
      gridMajor: '#1a1a1f',
      tracers: '#d21f1f', // disciplined red
      tracerSecondary: '#7a1919' // subtle dimmer red (for multi-line weight)
    },

    // Grid geometry
    grid: {
      minorStep: 56,   // px between minor lines at CSS pixel scale
      majorsEvery: 4,  // every N minors becomes a major line
      lineWidthMinor: 1, // device pixels (scaled by DPR internally)
      lineWidthMajor: 1.5
    },

    // Tracer agents
    tracers: {
      count: 26,
      speed: 140, // px per second at CSS pixel scale
      lineWidth: 2, // device pixels (scaled by DPR internally)
      junctionDecisionBias: {
        forward: 0.7,
        left: 0.15,
        right: 0.15
      },
      minTurnInterval: 0.10, // seconds; dampen micro-oscillation
      maxSegmentJitter: 0, // keep 0 for crisp orthogonality
      tailLength: 0, // 0 = full path as single segment; keep crisp
      allowBacktrack: false // never reverse on decision
    },

    // Rendering cadence
    targetFPS: 60
  };

  global.BG_CONFIG = BG_CONFIG;
})(window);
