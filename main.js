// main.js
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const { start } = await import('./engine.js');
    start();
  } catch (e) {
    console.error('Failed to start engine:', e);
  }
});
