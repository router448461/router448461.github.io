(() => {
  // Simple loader fade out
  function removeLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.add("fade-out");
    loader.setAttribute("aria-hidden", "true");
    setTimeout(() => loader.classList.add("removed"), 400);
  }

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(removeLoader, 1200); // fade loader after short delay
    setTimeout(() => {
      // Start 3D constellation
      if (window.engine && window.engine.start) window.engine.start();
    }, 1200);
  });
})();
