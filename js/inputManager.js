export class InputManager {
  constructor() {
    this.mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }
}
