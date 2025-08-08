export const config = {
   pixelRatio:      window.devicePixelRatio || 1,
   particleCount:   60,
   maxLinkDistance: 150,
   baseSpeed:       0.4,
   speedVariance:   0.5,
   particleRadius:  2,
   lineThickness:   1,

-  particleColor:   'rgba(139, 0, 0, 0.8)',
-  lineColor:       'rgba(85, 0, 0, 0.3)',
+  // threaten-mode colors
+  particleColor:   'rgba(0, 255, 0, 0.8)',   // neon-green predator nodes
+  lineColor:       'rgba(0, 255, 0, 0.2)',   // network beams

+  // shape & jitter
+  particleShape:   'triangle',               // switch from dot to triangle
+  jitterIntensity: 0.3,                     // random shake per frame

   // glow & pulsation (keep or dial down for menace)
   glowBlur:           8,        
   glowColor:         'rgba(0, 255, 0, 0.4)',
   pulseSpeed:        0.005,
   lineFlickerFreq:   0.02,
 };
