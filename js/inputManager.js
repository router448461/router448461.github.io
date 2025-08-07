// js/inputManager.js

export class InputManager {
  constructor(canvas) {
    this.pointer = { x: 0, y: 0 };

    canvas.addEventListener('mousemove', (e) => {
      this.pointer.x = e.clientX * (window.devicePixelRatio || 1);
      this.pointer.y = e.clientY * (window.devicePixelRatio || 1);
    });
  }

  // placeholder for future touch or keyboard input
  update() {
    // no-op
  }
}
