// js/Renderer.js

import { SpatialGrid } from './SpatialGrid.js';

export class Renderer {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;

    // must set dimensions before constructing grid
    if (!canvas.width || !canvas.height) {
      throw new Error('Renderer: canvas not sized—call resize() first.');
    }

    this.grid = new SpatialGrid(
      canvas.width,
      canvas.height,
      config.grid.cellSize
    );
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.grid = new SpatialGrid(
      width,
      height,
      this.config.grid.cellSize
    );
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.grid.clear();
  }

  drawParticles(particles) {
    this.ctx.fillStyle = this.config.particle.color;
    for (const p of particles) {
      this.ctx.beginPath();
      this.ctx.arc(
        p.position.x,
        p.position.y,
        this.config.particle.radius,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
  }
}
