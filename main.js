// main.js
window.addEventListener('DOMContentLoaded', async () => {
  // Lazy-load engine to keep initial parse small
  const { start } = await import('./engine.js');
  start();
});
