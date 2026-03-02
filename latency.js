function measureLatency(url) {
  const start = performance.now();
  fetch(url, { method: 'HEAD', mode: 'no-cors' })
    .then(() => {
      const end = performance.now();
      return Math.round(end - start);
    })
    .catch(() => null);
}
