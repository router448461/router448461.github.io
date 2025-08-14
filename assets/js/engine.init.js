export function removeLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.add("fade-out");
  loader.setAttribute("aria-hidden", "true");
  setTimeout(() => loader.classList.add("removed"), 400);
}
