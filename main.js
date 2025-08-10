// main.js
(function () {
  window.addEventListener('DOMContentLoaded', function () {
    if (window.BG && typeof window.BG.start === 'function') {
      window.BG.start();
    }
  });
})();
