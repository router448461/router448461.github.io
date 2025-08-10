// settings.js
(function () {
  const BG = (window.BG = window.BG || {});

  BG.cssVar = function (name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  };

  BG.hexToRgb = function (hex) {
    const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return [255, 159, 10];
    return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  };

  BG.resolveTheme = function () {
    const accent = BG.hexToRgb(BG.cssVar('--accent') || '#ff9f0a');
    // Derived tones
    const red = [220, 68, 55];
    const grid = accent; // keep disciplined, single-accent system

    return {
      // Particles and links
      particleRGBA: (alpha = 0.9) => `rgba(${accent[0]},${accent[1]},${accent[2]},${alpha})`,
      lineRGB: accent,
      lineMaxAlpha: 0.82,
      lineWidth: 0.9,

      // HUD
      gridRGB: grid,
      gridAlpha: 0.05,
      pulseGoodRGB: accent,
      pulseThreatRGB: red,
      coreRGB: accent,

      // Text
      textRGBA: (a = 0.45) => `rgba(200,200,200,${a})`,
      labelRGBA: (a = 0.35) => `rgba(${accent[0]},${accent[1]},${accent[2]},${a})`
    };
  };

  BG.theme = BG.resolveTheme();

  BG.CONFIG = {
    // Particles
    areaPerParticle: 9000,
    minCount: 90,
    maxCount: 700,
    maxSpeed: 0.35,

    // Links
    linkDistance: 120,
    enableLines: true,

    // Pulsing
    enablePulse: true,
    pulse1Hz: 1.0,
    pulse2Hz: 0.667,
    pulse2Mix: 0.35,
    pulseAmplitude: 0.35,
    lineLfoHz: 0.2,

    // HUD toggles
    enableHUD: true,
    hud: {
      grid: true,
      pulses: true,
      core: true,
      ambient: true,
      debug: false
    },

    // HUD params
    gridSpacing: 48,
    gridParallax: 0.03,
    pulseIntervalSec: 8,
    pulseJitterSec: 2.5,
    pulseMaxRadius: 420,
    pulseWidth: 1.2,
    ambientIntensity: 0.08, // 0..1 scalar for soft-light
    ambientLfoHz: 0.05,
    coreRadius: 6.0,
    coreGlow: 42, // px
    coreHoldStrength: 0.08 // 0..1 easing back to center
  };

  BG.clamp = function (n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  };

  BG.rBaseScale = function (dpr, W, H) {
    const minDim = Math.min(W, H);
    const viewScale = BG.clamp(1 + ((minDim - 700) / 1200) * 0.18, 0.92, 1.22);
    const dprScale = BG.clamp(Math.pow(dpr, 0.25), 0.95, 1.15);
    return viewScale * dprScale;
  };

  BG.computeBias = function (W, H, maxSpeed) {
    const angle = W >= H ? Math.PI / 8 : Math.PI / 2 + Math.PI / 12;
    const mag = maxSpeed * 0.18;
    return { vx: Math.cos(angle) * mag, vy: Math.sin(angle) * mag };
  };

  BG.refreshTheme = function () {
    BG.theme = BG.resolveTheme();
  };
})();
