import { removeLoader } from "./engine.init.js";
import { startConstellation2D } from "./engine.visuals.2d.js";

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(removeLoader, 1000);
  setTimeout(() => {
    startConstellation2D();
  }, 1000);
});
