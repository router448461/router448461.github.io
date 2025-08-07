// js/main.js
import { Network } from './network.js';

const canvas  = document.getElementById('network');
const network = new Network(canvas);

function animate() {
  network.updateAndDraw();
  requestAnimationFrame(animate);
}

animate();
