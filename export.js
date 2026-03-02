function exportHistory() {
  const history = JSON.parse(localStorage.getItem('connHistory') || '[]');
  const csv = ['host,lat,lon,category,time,latency'];
  history.forEach(h => {
    csv.push(`${h.host},${h.lat},${h.lon},${h.category},${new Date(h.time).toISOString()},${h.latency || ''}`);
  });
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `connections_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
