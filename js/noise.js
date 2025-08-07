// Minimal Perlin noise (improved) from Stefan Gustavson
class Noise {
  constructor() {
    this.perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    // shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(a, b, t) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  perlin2(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const topRight = this.perm[this.perm[X + 1] + Y + 1];
    const topLeft  = this.perm[this.perm[X]     + Y + 1];
    const bottomRight = this.perm[this.perm[X + 1] + Y];
    const bottomLeft  = this.perm[this.perm[X]     + Y];

    const u = this.fade(xf);
    const v = this.fade(yf);

    const x1 = this.lerp(
      this.grad(bottomLeft, xf, yf),
      this.grad(bottomRight, xf - 1, yf),
      u
    );
    const x2 = this.lerp(
      this.grad(topLeft, xf, yf - 1),
      this.grad(topRight, xf - 1, yf - 1),
      u
    );
    return (this.lerp(x1, x2, v) + 1) / 2;
  }
}

export const noise = new Noise();
