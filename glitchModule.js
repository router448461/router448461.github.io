// glitchModule.js
export function startGlitch() {
  const glitchOverlay = document.getElementById('glitch-overlay');
  if (!glitchOverlay) {
    console.error('Glitch overlay element not found.');
    return;
  }

  // Subtle Audio Feedback: Play a low‑volume 100ms beep using the Web Audio API.
  function playGlitchSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 440; // A4 tone
      gainNode.gain.value = 0.05;         // Very low volume
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.1);
      setTimeout(() => ctx.close(), 100);
    } catch (error) {
      console.error('Error playing glitch sound:', error);
    }
  }

  const triggerGlitch = () => {
    try {
      glitchOverlay.classList.add('glitch-active');
      playGlitchSound(); // Audio feedback on each glitch event.
      setTimeout(() => {
        glitchOverlay.classList.remove('glitch-active');
      }, 300);
      // Schedule the next glitch between 2000ms and 7000ms.
      const nextGlitch = Math.random() * 5000 + 2000;
      setTimeout(triggerGlitch, nextGlitch);
    } catch (error) {
      console.error('Error during glitch trigger:', error);
    }
  };

  triggerGlitch();
}
