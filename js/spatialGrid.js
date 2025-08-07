export class SpatialGrid {
  constructor(width, height, cellSize) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.buckets = new Array(this.cols * this.rows);
    this.clear();
  }

  clear() {
    this.buckets.fill(null).map((_, i) => (this.buckets[i] = []));
  }

  insert(p) {
    const col = Math.floor(p.x / this.cellSize);
    const row = Math.floor(p.y / this.cellSize);
    const idx = row * this.cols + col;
    if (this.buckets[idx]) this.buckets[idx].push(p);
  }

  query(p) {
    const col = Math.floor(p.x / this.cellSize);
    const row = Math.floor(p.y / this.cellSize);
    const found = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const c = col + i;
        const r = row + j;
        if (c >= 0 && r >= 0 && c < this.cols && r < this.rows) {
          found.push(...this.buckets[r * this.cols + c]);
        }
      }
    }
    return found;
  }
}
