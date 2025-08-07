class Line {
  static draw(ctx, p1, p2, maxDist = 120) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < maxDist) {
      const alpha = 1 - dist / maxDist;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(0, 255, 128, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

window.Line = Line;
