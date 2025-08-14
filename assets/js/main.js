import { removeLoader } from './engine.init.js';
import { startConstellation } from './engine.visuals.js';

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(removeLoader, 1200);
  setTimeout(() => {
    startConstellation();
  }, 1200);
});
