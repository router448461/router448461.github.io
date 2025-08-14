import { removeLoader } from './engine.init.js';
import { startConstellation } from './engine.visuals.js';

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(removeLoader, 1000);
  setTimeout(() => {
    startConstellation();
  }, 1000);
});
