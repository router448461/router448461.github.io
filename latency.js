function measureLatency(url) {
  const start = performance.now();
  return fetch(url, { method: 'HEAD', mode: 'no-cors' })
    .then(() => {
      const end = performance.now();
      const latency = Math.round(end - start);
      console.log(`Latency for ${url}: ${latency}ms`);
      return latency;
    })
    .catch(() => {
      console.log(`Latency measurement failed for ${url}`);
      return null;
    });
}
