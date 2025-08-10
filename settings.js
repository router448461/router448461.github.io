// settings.js
export function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function hexToRgb(hex) {
  const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return [255, 159, 10];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

// Resolve theme at runtime so CSS is definitely applied
export function resolveTheme() {
  const accent = hexToRgb(cssVar('--accent') || '#ff9f0a');
  return {
    particleRGBA: (alpha = 0.9) => `rgba(${accent[0]},${accent[1]},${accent[2]},${alpha})`,
    lineRGB: accent,
    lineMaxAlpha: 0.82,
    lineWidth: 0.9
  };
}

export const CONFIG = {
  areaPerParticle: 9000,
  minCount: 90,
  maxCount: 700,
  maxSpeed: 0.35,
  linkDistance: 120,
  enableLines: true,
  enablePulse: true,
  pulse1Hz: 1.0,
  pulse2Hz: 0.667,
  pulse2Mix: 0.35,
  pulseAmplitude: 0.35,
  lineLfoHz: 0.2
};

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

export function rBaseScale(dpr, W, H) {
  const minDim = Math.min(W, H);
  const viewScale = clamp(1 + ((minDim - 700) / 1200) * 0.18, 0.92, 1.22);
  const dprScale = clamp(Math.pow(dpr, 0.25), 0.95, 1.15);
  return viewScale * dprScale;
}

export function computeBias(W, H, maxSpeed) {
  const angle = (W >= H) ? Math.PI / 8 : (Math.PI / 2 + Math.PI / 12);
  const mag = maxSpeed * 0.18;
  return { vx: Math.cos(angle) * mag, vy: Math.sin(angle) * mag };
}
