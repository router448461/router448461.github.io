export const config = {
  // Rendering
  pixelRatio: Math.min(window.devicePixelRatio || 1, 2),

  // Link geometry
  maxLinkDistance: 140,     // in CSS pixels (DPR-correct via transform)
  lineThickness: 1.2,

  // Autonomous behaviors
  autonomy: {
    dynamicACL: false,      // if true, ACL links can rotate periodically
    aclShiftMs: 60000       // period for ACL rule rotation
  },

  // Zone definitions (menacing, disciplined)
  clusters: {
    weapon: {
      label: 'weapon.zone',
      color: 'rgba(170, 5, 5, 0.90)',
      linkColor: 'rgba(150, 10, 10, 0.35)',
      linkColorActive: 'rgba(210, 20, 20, 0.55)',
      particleCount: 26,
      radius: 2.3,
      speed: { base: 0.38, var: 0.28 },
      behavior: {
        heartbeatMs: [3500, 5500],
        quarantineProb: 0.00, // per heartbeat cycle, fraction of particles to quarantine
        jitter: 0.15,
        trustHalo: true
      },
      // Normalized center and radius (relative to min(W,H))
      region: { cx: 0.32, cy: 0.50, r: 0.26 }
    },
    weapon2: {
      label: 'weapon2.zone',
      color: 'rgba(140, 10, 10, 0.85)',
      linkColor: 'rgba(120, 12, 12, 0.32)',
      linkColorActive: 'rgba(190, 24, 24, 0.52)',
      particleCount: 24,
      radius: 2.1,
      speed: { base: 0.30, var: 0.24 },
      behavior: {
        heartbeatMs: [4200, 6200],
        quarantineProb: 0.02,
        jitter: 0.12,
        trustHalo: true
      },
      region: { cx: 0.68, cy: 0.46, r: 0.24 }
    },
    weapon3: {
      label: 'weapon3.zone',
      color: 'rgba(110, 8, 8, 0.78)',
      linkColor: 'rgba(100, 8, 8, 0.25)',
      linkColorActive: 'rgba(160, 18, 18, 0.45)',
      particleCount: 22,
      radius: 2.0,
      speed: { base: 0.18, var: 0.18 },
      behavior: {
        heartbeatMs: [5000, 8000],
        quarantineProb: 0.06,
        jitter: 0.10,
        trustHalo: false
      },
      region: { cx: 0.50, cy: 0.72, r: 0.22 }
    }
  },

  // ACL allow rules (outbound)
  allowMatrix: {
    weapon: ['weapon2'],
    weapon2: ['weapon'],
    weapon3: [] // isolated by default
  }
};
