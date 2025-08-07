// js/SpatialGrid.js

export class SpatialGrid {
  constructor(width, height, cellSize) {
    this.cellSize = Number(cellSize) || 0;

    // compute number of columns & rows
    this.cols = Math.ceil(Number(width) / this.cellSize);
    this.rows = Math.ceil(Number(height) / this.cellSize);

    // validations
    if (this.cellSize <= 0) {
      throw new Error(`SpatialGrid: invalid cellSize ${cellSize}`);
    }
    if (!Number.isSafeInteger(this.cols) || this.cols < 1) {
      throw new Error(`SpatialGrid: invalid cols ${this.cols}`);
    }
    if (!Number.isSafeInteger(this.rows) || this.rows < 1) {
      throw new Error(`SpatialGrid: invalid rows ${this.rows}`);
    }

    // initialize empty buckets
    this.cells = Array.from(
      { length: this.cols * this.rows },
      () => []
    );
  }

  clear() {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].length = 0;
    }
  }

  insert(particle) {
    const col = Math.min(
      this.cols - 1,
      Math.max(0, Math.floor(particle.position.x / this.cellSize))
    );
    const row = Math.min(
      this.rows - 1,
      Math.max(0, Math.floor(particle.position.y / this.cellSize))
    );
    this.cells[row * this.cols + col].push(particle);
  }
}
