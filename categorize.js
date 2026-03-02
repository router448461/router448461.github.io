function categorizeDomain(host) {
  if (host.includes('cloudflare') || host.includes('akamai')) return 'CDN';
  if (host.includes('googleapis') || host.includes('api.')) return 'API';
  if (host.match(/\.(jpg|png|mp4|webm|svg)/)) return 'Media';
  return 'Other';
}

function getColorByCategory(cat) {
  switch (cat) {
    case 'CDN': return 'cyan';
    case 'API': return 'orange';
    case 'Media': return 'magenta';
    default: return 'lime';
  }
}
