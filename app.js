// FIRMAMENT // CONTROL — Demonstration UI (client-only, fictional)

(() => {
  "use strict";

  // Utility: timestamp + log
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  const tz = () => {
    const d = new Date();
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}Z`;
  };
  const logEl = document.getElementById("log-scroll");
  function log(line) {
    const t = tz();
    const item = document.createElement("div");
    item.textContent = `[${t}] ${line}`;
    logEl.appendChild(item);
    logEl.scrollTop = logEl.scrollHeight;
  }

  // Header lamps + clock
  const lamps = {
    comms: document.querySelector('.lamp[data-lamp="comms"]'),
    telemetry: document.querySelector('.lamp[data-lamp="telemetry"]'),
    auth: document.querySelector('.lamp[data-lamp="auth"]'),
  };
  const clock = document.getElementById("clock");
  const dpiRead = document.getElementById("dpi");

  function bootLamps() {
    setTimeout(() => lamps.comms.classList.add("on"), 200);
    setTimeout(() => lamps.telemetry.classList.add("on"), 400);
    setTimeout(() => lamps.auth.classList.toggle("on"), 700);
  }

  function tickClock() {
    clock.textContent = tz();
    requestAnimationFrame(tickClock);
  }

  // Session ID
  const session = Math.random().toString(36).slice(2, 8).toUpperCase();
  document.getElementById("session-id").textContent = session;

  // Canvas setup with DPR scaling
  const canvas = document.getElementById("matrix");
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  const gridSize = 48;       // px
  const majorEvery = 4;      // major line multiplier
  let DPR = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  dpiRead.textContent = DPR.toFixed(2);

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * DPR);
    canvas.height = Math.floor(rect.height * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawStaticGrid();
  }

  window.addEventListener("resize", resizeCanvas);

  // Draw crisp lines (offset by 0.5 on 1x DPR)
  function line(x1, y1, x2, y2, color = "#2b2f34") {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, y1 + 0.5);
    ctx.lineTo(x2 + 0.5, y2 + 0.5);
    ctx.stroke();
  }

  function drawStaticGrid() {
    const w = canvas.width / DPR;
    const h = canvas.height / DPR;

    ctx.fillStyle = "#0b0c0e";
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = 1;

    // Minor grid
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--grid").trim();
    for (let x = 0; x <= w; x += gridSize) {
      line(x, 0, x, h, ctx.strokeStyle);
    }
    for (let y = 0; y <= h; y += gridSize) {
      line(0, y, w, y, ctx.strokeStyle);
    }

    // Major grid
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--grid-strong").trim();
    for (let x = 0; x <= w; x += gridSize * majorEvery) {
      line(x, 0, x, h, ctx.strokeStyle);
    }
    for (let y = 0; y <= h; y += gridSize * majorEvery) {
      line(0, y, w, y, ctx.strokeStyle);
    }

    // Sector ticks (12)
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);
    const radius = Math.min(w, h) * 0.46;
    ctx.strokeStyle = "#3a4046";
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const ix = Math.round(cx + Math.cos(a) * (radius - 18));
      const iy = Math.round(cy + Math.sin(a) * (radius - 18));
      const ox = Math.round(cx + Math.cos(a) * radius);
      const oy = Math.round(cy + Math.sin(a) * radius);
      line(ix, iy, ox, oy, "#3a4046");
    }

    // Concentric rings (hard lines, no glow)
    for (let r = radius * 0.2; r <= radius; r += radius * 0.2) {
      ctx.strokeStyle = "#3a4046";
      ctx.beginPath();
      ctx.arc(cx + 0.5, cy + 0.5, Math.round(r), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Contacts (fictional)
  const contacts = [];
  const CONTACT_COUNT = 9;
  function seedContacts() {
    contacts.length = 0;
    const w = canvas.width / DPR;
    const h = canvas.height / DPR;
    const cx = w / 2, cy = h / 2;
    for (let i = 0; i < CONTACT_COUNT; i++) {
      const angle = (i / CONTACT_COUNT) * Math.PI * 2 + (i % 3) * 0.13;
      const r = Math.min(w, h) * (0.18 + (i % 5) * 0.08);
      contacts.push({
        id: `C${(i + 1).toString().padStart(2, "0")}`,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        v: (i % 2 ? 1 : -1) * (0.2 + (i % 4) * 0.03), // deg/s
        course: (angle * 180) / Math.PI,
        status: i % 3 === 0 ? "MON" : "UNK",
        priority: (i % 5) + 1,
      });
    }
    document.getElementById("contact-count").textContent = contacts.length;
  }

  function drawContact(c) {
    const size = 9;
    ctx.strokeStyle = c.status === "MON" ? "#cbd5df" : "#8e98a3";
    ctx.strokeRect(Math.round(c.x - size / 2) + 0.5, Math.round(c.y - size / 2) + 0.5, size, size);

    ctx.fillStyle = "#8e98a3";
    const label = `${c.id}/${c.status}/P${c.priority}`;
    ctx.fillText(label, Math.round(c.x + 10), Math.round(c.y - 8));
  }

  // Sweep (hard-line, no glow)
  let sweepDeg = 0;
  function drawSweep() {
    const w = canvas.width / DPR;
    const h = canvas.height / DPR;
    const cx = Math.floor(w / 2);
    const cy = Math.floor(h / 2);
    const radius = Math.min(w, h) * 0.46;

    // Redraw grid base
    drawStaticGrid();

    // Draw contacts
    ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.textBaseline = "top";

    contacts.forEach((c, i) => {
      // Update minimal drift
      const drift = (c.v / 60) * (Math.PI / 180);
      c.x += Math.cos(drift + i * 0.03) * 0.6;
      c.y += Math.sin(drift + i * 0.02) * 0.6;
      drawContact(c);
    });

    // Sweep line
    ctx.strokeStyle = "#e22525"; // warning red
    ctx.lineWidth = 1;
    const a = (sweepDeg * Math.PI) / 180;
    const ex = Math.round(cx + Math.cos(a) * radius);
    const ey = Math.round(cy + Math.sin(a) * radius);
    line(cx, cy, ex, ey, "#e22525");

    // Advance sweep
    sweepDeg = (sweepDeg + 1.8) % 360;
  }

  function animate() {
    drawSweep();
    requestAnimationFrame(animate);
  }

  // Ordnance manifest (fictional, static)
  const ordList = document.getElementById("ord-list");
  const payloads = [
    { name: "PKG-01", class: "KIN", range: "300km", state: "SAFE" },
    { name: "PKG-02", class: "EW",  range: "LOS",   state: "SAFE" },
    { name: "PKG-03", class: "INT", range: "120km", state: "SAFE" },
    { name: "PKG-04", class: "ISR", range: "ORB",   state: "SAFE" },
    { name: "PKG-05", class: "KIN", range: "600km", state: "SAFE" },
  ];

  function renderPayloads() {
    ordList.innerHTML = "";
    payloads.forEach((p, idx) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");
      li.dataset.index = idx;

      const left = document.createElement("div");
      left.textContent = `${p.name} / ${p.class} / ${p.range}`;

      const mid = document.createElement("div");
      mid.className = "tag";
      mid.textContent = p.state;

      const right = document.createElement("div");
      right.className = "tag";
      right.textContent = "IDLE";

      li.appendChild(left);
      li.appendChild(mid);
      li.appendChild(right);

      li.addEventListener("click", () => {
        const sel = ordList.querySelectorAll("li[aria-selected='true']");
        sel.forEach(n => n.setAttribute("aria-selected", "false"));
        li.setAttribute("aria-selected", "true");
      });

      ordList.appendChild(li);
    });
  }

  // Controls
  const btnArm = document.getElementById("btn-arm");
  const btnSafe = document.getElementById("btn-safe");
  const btnExec = document.getElementById("btn-exec");
  const btnAuth = document.getElementById("btn-auth");
  const btnLock = document.getElementById("btn-lock");
  const conditionEl = document.getElementById("condition");
  const clearanceEl = document.getElementById("clearance");

  btnArm.addEventListener("click", () => {
    payloads.forEach(p => p.state = "ARMED");
    renderPayloads();
    btnArm.setAttribute("aria-pressed", "true");
    btnSafe.setAttribute("aria-pressed", "false");
    conditionEl.textContent = "AMBER";
    log("PAYLOAD STATE -> ARMED");
  });

  btnSafe.addEventListener("click", () => {
    payloads.forEach(p => p.state = "SAFE");
    renderPayloads();
    btnArm.setAttribute("aria-pressed", "false");
    btnSafe.setAttribute("aria-pressed", "true");
    conditionEl.textContent = "WHITE";
    log("PAYLOAD STATE -> SAFE");
  });

  btnExec.addEventListener("click", () => {
    const roe = document.getElementById("roe").value;
    const tmode = document.getElementById("tmode").value;
    log(`EXECUTE: ROE=${roe}; TMODE=${tmode};`);
  });

  btnAuth.addEventListener("click", () => {
    const pressed = btnAuth.getAttribute("aria-pressed") === "true";
    btnAuth.setAttribute("aria-pressed", String(!pressed));
    lamps.auth.classList.toggle("on", !pressed);
    if (!pressed) {
      clearanceEl.textContent = "RESTRICTED";
      log("AUTH: ELEVATED");
    } else {
      clearanceEl.textContent = "UNCLASS";
      log("AUTH: DE-ESCALATED");
    }
  });

  btnLock.addEventListener("click", () => {
    const pressed = btnLock.getAttribute("aria-pressed") === "true";
    btnLock.setAttribute("aria-pressed", String(!pressed));
    log(pressed ? "CONSOLE: UNLOCKED" : "CONSOLE: LOCKED");
  });

  document.getElementById("roe").addEventListener("change", (e) => {
    log(`ROE -> ${e.target.value}`);
  });
  document.getElementById("tmode").addEventListener("change", (e) => {
    log(`TARGETING -> ${e.target.value}`);
  });

  // Init
  function init() {
    bootLamps();
    tickClock();
    resizeCanvas();
    seedContacts();
    renderPayloads();
    animate();
    log("FIRMAMENT UI READY");
  }

  // Run
  window.addEventListener("DOMContentLoaded", init);
})();
