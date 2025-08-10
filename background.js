"use strict";

/*
  Minimal tactical grid:
  - Static grid (no animation)
  - Minor lines every 48px; major every 192px
  - 1px strokes with 0.5 offset for crispness
*/

(function(){
  const CANVAS_ID = "bg";
  const GRID_STEP = 48;         // minor grid spacing (px)
  const MAJOR_STEP = GRID_STEP * 4; // major grid spacing (px)
  const COLORS = {
    bg: "#0a0a0a",
    minor: "#a81818",
    major: "#ff2a2a",
  };

  const canvas = document.getElementById(CANVAS_ID);
  const ctx = canvas.getContext("2d");

  function sizeToViewport(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function clear(){
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawGrid(){
    const w = canvas.width;
    const h = canvas.height;

    clear();

    ctx.lineWidth = 1;

    // Minor grid
    ctx.strokeStyle = COLORS.minor;
    ctx.beginPath();
    for(let x = 0.5; x <= w; x += GRID_STEP){
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for(let y = 0.5; y <= h; y += GRID_STEP){
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Major grid
    ctx.strokeStyle = COLORS.major;
    ctx.beginPath();
    for(let x = 0.5; x <= w; x += MAJOR_STEP){
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for(let y = 0.5; y <= h; y += MAJOR_STEP){
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  }

  function redraw(){
    sizeToViewport();
    drawGrid();
  }

  // Initial draw and basic responsiveness
  redraw();
  window.addEventListener("resize", redraw);
})();
