import { ctx, width, height } from './canvas.js';
import { CONFIG } from './config.js';
import { LineEntity } from './line.js';

CONFIG.centerX = width / 2;
CONFIG.centerY = height / 2;

const lines = Array.from({ length: CONFIG.lineCount }, () => new LineEntity());
let lastTime = performance.now();

function animate(time) {
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  // Fade canvas slightly for trail effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, width, height);

  // Sink ring
  ctx.beginPath();
  ctx.arc(CONFIG.centerX, CONFIG.centerY, CONFIG.sinkRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Center glow gradient
  const gradient = ctx.createRadialGradient(CONFIG.centerX, CONFIG.centerY, 0, CONFIG.centerX, CONFIG.centerY, CONFIG.gradientRadius);
  gradient.addColorStop(0, 'rgba(0, 255, 0, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(CONFIG.centerX, CONFIG.centerY, CONFIG.gradientRadius, 0, Math.PI * 2);
  ctx.fill();

  // Update and draw each line entity
  for (const line of lines) {
    line.update(delta);
    line.drawLine();
    line.drawDot();
  }

  requestAnimationFrame(animate);
}

animate(lastTime);
