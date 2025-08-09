export const config = {
  clusters: {
    prod: {
      label: 'prod.zone',
      color: 'rgba(120, 0, 0, 0.85)',
      linkColor: 'rgba(120, 0, 0, 0.3)',
      particleCount: 25
    },
    legacy: {
      label: 'legacy.zone',
      color: 'rgba(100, 0, 0, 0.7)',
      linkColor: 'rgba(100, 0, 0, 0.25)',
      particleCount: 20
    },
    media: {
      label: 'media.zone',
      color: 'rgba(160, 20, 20, 0.8)',
      linkColor: 'rgba(160, 20, 20, 0.28)',
      particleCount: 25
    }
  },
  lineThickness: 1.1,
  maxLinkDistance: 120,
  allowMatrix: {
    prod: ['media'],
    media: ['prod'],
    legacy: [] // isolated
  }
};
