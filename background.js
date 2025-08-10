"use strict";

(function () {
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawGrid();
  }

  function drawGrid() {
    const spacing = 40;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = 0.5; x < w; x += spacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0.5; y < h; y += spacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  }

  resize();
  window.addEventListener("resize", resize);
})();
