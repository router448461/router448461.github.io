function exportHistory() {
  const history = JSON.parse(localStorage.getItem('connHistory') || '[]');
  
  if (history.length === 0) {
    alert('No connection history to export');
    return;
  }
  
  // Create CSV header
  let csv = 'Host,Category,Latitude,Longitude,Latency (ms),Timestamp\n';
  
  // Add data rows
  history.forEach(conn => {
    const timestamp = new Date(conn.time).toISOString();
    csv += `"${conn.host}","${conn.category}",${conn.lat},${conn.lon},"${conn.latency || 'N/A'}","${timestamp}"\n`;
  });
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `connection-history-${Date.now()}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
}
