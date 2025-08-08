export class Network {
   constructor(canvas) {
     // … existing setup …
     this._time = 0;
   }

   updateAndDraw() {
     const { ctx, cfg, W, H } = this;
     ctx.clearRect(0, 0, W, H);

     // pulsing alpha
     const pulse = 0.5 + Math.sin(this._time * cfg.pulseSpeed) * 0.5;
     this._time++;

     // glow + jitter
     ctx.save();
     ctx.shadowBlur  = cfg.glowBlur;
     ctx.shadowColor = cfg.glowColor;
     ctx.globalAlpha = pulse;

     this.particles.forEach(p => {
-      p.update();
-      p.draw(ctx);
+      p.update();

+      // apply electrical jitter
+      if (cfg.jitterIntensity) {
+        p.x += (Math.random() - 0.5) * cfg.jitterIntensity;
+        p.y += (Math.random() - 0.5) * cfg.jitterIntensity;
+      }

+      // draw as triangle if threat-mode
+      if (cfg.particleShape === 'triangle') {
+        const size = cfg.particleRadius * 2;
+        ctx.beginPath();
+        ctx.moveTo(p.x, p.y - size);
+        ctx.lineTo(p.x - size, p.y + size);
+        ctx.lineTo(p.x + size, p.y + size);
+        ctx.closePath();
+        ctx.fillStyle = cfg.particleColor;
+        ctx.fill();
+      } else {
+        p.draw(ctx);
+      }
     });

     ctx.restore();

     // links with flicker (unchanged)
     this._buildGrid();
     this._drawLinks(link => {
       if (Math.random() < cfg.lineFlickerFreq) {
         ctx.strokeStyle = cfg.particleColor;
         ctx.lineWidth   = cfg.lineThickness + 1;
         link();
         ctx.strokeStyle = cfg.lineColor;
         ctx.lineWidth   = cfg.lineThickness;
       } else {
         link();
       }
     });
   }
 }
