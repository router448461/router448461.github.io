const canvas = document.getElementById("world-canvas");
const ctx = canvas.getContext("2d");

const el = {
  statusDot: document.getElementById("status-dot"),
  statusText: document.getElementById("status-text"),
  localTime: document.getElementById("local-time"),
  utcTime: document.getElementById("utc-time"),
  sourceTag: document.getElementById("source-tag"),
  infoRows: document.getElementById("info-rows"),
};

const state = {
  startedAt: Date.now(),
  meta: null,
  viewer: {
    lat: null,
    lon: null,
    accuracy: null,
    source: "no fix",
    permission: "unknown",
  },
  size: {
    width: 0,
    height: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
  },
};

const landmasses = [
  [[-168,72],[-150,60],[-138,57],[-130,50],[-125,44],[-122,38],[-116,31],[-106,24],[-97,19],[-88,19],[-82,24],[-80,30],[-75,35],[-70,42],[-66,49],[-60,54],[-64,61],[-76,69],[-100,74],[-130,72]],
  [[-82,12],[-79,4],[-76,-7],[-72,-16],[-68,-24],[-63,-31],[-59,-40],[-61,-52],[-68,-55],[-75,-49],[-79,-37],[-81,-23],[-81,-10]],
  [[-56,82],[-42,76],[-28,72],[-24,66],[-31,60],[-45,60],[-56,66],[-60,74]],
  [[-10,35],[-5,43],[3,49],[12,55],[24,59],[34,57],[40,52],[34,46],[27,43],[20,40],[12,36],[4,36],[-3,39]],
  [[-17,35],[-4,33],[10,30],[20,22],[28,10],[32,-2],[33,-12],[29,-22],[22,-31],[12,-35],[2,-34],[-6,-27],[-12,-14],[-15,-1]],
  [[35,55],[48,62],[68,68],[92,71],[118,66],[139,58],[146,46],[141,34],[130,24],[118,15],[108,8],[97,6],[86,9],[75,17],[66,26],[58,34],[50,42],[43,49]],
  [[112,-11],[119,-20],[129,-25],[140,-28],[151,-35],[146,-43],[134,-44],[121,-38],[114,-28]],
  [[-180,-72],[-140,-75],[-90,-77],[-30,-76],[20,-75],[80,-77],[140,-75],[180,-72]],
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}

function safe(value, fallback = "n/a") {
  return value === null || value === undefined || value === "" ? fallback : String(value).toLowerCase();
}

function yesNo(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "n/a";
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

function setStatus(text, tone = "warn") {
  el.statusText.textContent = String(text).toLowerCase();
  el.statusDot.className = "status-dot";
  if (tone === "good") el.statusDot.classList.add("good");
  if (tone === "bad") el.statusDot.classList.add("bad");
}

function renderRows(rows) {
  el.infoRows.innerHTML = rows.map((row) => `
    <div class="data-row">
      <div class="row-key">${escapeHtml(row.key.toLowerCase())}</div>
      <div class="row-value${row.tone ? ` ${row.tone}` : ""}">${escapeHtml(String(row.value).toLowerCase())}</div>
    </div>
  `).join("");
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  state.size.width = Math.max(320, Math.floor(rect.width));
  state.size.height = Math.max(240, Math.floor(rect.height));

  canvas.width = Math.floor(state.size.width * state.size.dpr);
  canvas.height = Math.floor(state.size.height * state.size.dpr);
  ctx.setTransform(state.size.dpr, 0, 0, state.size.dpr, 0, 0);
}

function project(lon, lat) {
  return {
    x: ((lon + 180) / 360) * state.size.width,
    y: ((90 - lat) / 180) * state.size.height,
  };
}

function drawBackground() {
  const { width, height } = state.size;

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "rgba(8,18,28,0.96)");
  bg.addColorStop(1, "rgba(3,6,10,0.98)");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(152, 216, 255, 0.08)";
  ctx.lineWidth = 1;

  for (let lon = -180; lon <= 180; lon += 30) {
    const { x } = project(lon, 0);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let lat = -60; lat <= 60; lat += 30) {
    const { y } = project(0, lat);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawWorld() {
  ctx.fillStyle = "rgba(110,170,210,0.10)";
  ctx.strokeStyle = "rgba(152,216,255,0.16)";
  ctx.lineWidth = 1.1;

  for (const poly of landmasses) {
    ctx.beginPath();
    poly.forEach(([lon, lat], i) => {
      const p = project(lon, lat);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawSweep(time) {
  const { width, height } = state.size;
  const phase = (time * 0.00011) % 1;
  const x = phase * width;

  const grad = ctx.createLinearGradient(x - 90, 0, x + 90, 0);
  grad.addColorStop(0, "rgba(143,255,216,0)");
  grad.addColorStop(0.5, "rgba(143,255,216,0.16)");
  grad.addColorStop(1, "rgba(143,255,216,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(x - 90, 0, 180, height);

  ctx.strokeStyle = "rgba(143,255,216,0.42)";
  ctx.lineWidth = 1.3;
  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(143,255,216,0.55)";
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawMarker(time) {
  if (typeof state.viewer.lat !== "number" || typeof state.viewer.lon !== "number") return;

  const { x, y } = project(state.viewer.lon, state.viewer.lat);
  const pulse = (Math.sin(time * 0.004) + 1) * 0.5;

  for (let i = 0; i < 2; i += 1) {
    const r = ((time * 0.06 + i * 35) % 90);
    const alpha = Math.max(0, 1 - r / 90) * 0.2;
    ctx.strokeStyle = `rgba(143,255,216,${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 8 + r * 0.55, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(143,255,216,0.95)";
  ctx.shadowBlur = 22;
  ctx.shadowColor = "rgba(143,255,216,0.8)";
  ctx.beginPath();
  ctx.arc(x, y, 4 + pulse * 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(152,216,255,0.65)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.lineTo(x + 12, y);
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x, y + 12);
  ctx.stroke();
}

function drawFrame() {
  const { width, height } = state.size;
  ctx.strokeStyle = "rgba(152,216,255,0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(18, 18, width - 36, height - 36);
}

function animate(time) {
  drawBackground();
  drawWorld();
  drawSweep(time);
  drawMarker(time);
  drawFrame();
  requestAnimationFrame(animate);
}

async function timedJsonFetch(url, timeout = 3500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`http ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function loadMeta() {
  try {
    const meta = await timedJsonFetch("/.netlify/functions/netmeta", 3500);
    state.meta = meta || null;

    if (typeof meta.lat === "number" && typeof meta.lon === "number") {
      state.viewer.lat = meta.lat;
      state.viewer.lon = meta.lon;
      state.viewer.source = "ip approx";
    }
  } catch {}
}

async function detectPermission() {
  if (!navigator.permissions?.query) return;
  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    state.viewer.permission = result.state;
  } catch {}
}

async function getPreciseLocation() {
  if (!navigator.geolocation) return;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.viewer.lat = pos.coords.latitude;
        state.viewer.lon = pos.coords.longitude;
        state.viewer.accuracy = pos.coords.accuracy;
        state.viewer.source = "gps";
        state.viewer.permission = "granted";
        resolve();
      },
      () => resolve(),
      {
        enableHighAccuracy: true,
        timeout: 4500,
        maximumAge: 60000,
      }
    );
  });
}

function updateClocks() {
  const now = new Date();
  el.localTime.textContent = now.toLocaleString([], { hour12: false });
  el.utcTime.textContent = now.toUTCString().toLowerCase();
}

function updateInfo() {
  const rows = [
    { key: "source", value: state.viewer.source, tone: state.viewer.source === "gps" ? "good" : "warn" },
    { key: "latitude", value: typeof state.viewer.lat === "number" ? state.viewer.lat.toFixed(4) : "n/a" },
    { key: "longitude", value: typeof state.viewer.lon === "number" ? state.viewer.lon.toFixed(4) : "n/a" },
    { key: "public ip", value: safe(state.meta?.ip) },
    { key: "country", value: safe(state.meta?.country) },
    { key: "city", value: safe(state.meta?.city) },
    { key: "online", value: yesNo(navigator.onLine), tone: navigator.onLine ? "good" : "bad" },
    { key: "uptime", value: formatDuration(Date.now() - state.startedAt) },
  ];

  el.sourceTag.textContent = state.viewer.source.toLowerCase();
  renderRows(rows);
}

function updateStatus() {
  if (typeof state.viewer.lat === "number" && typeof state.viewer.lon === "number") {
    setStatus("tracking", "good");
    return;
  }

  if (state.meta?.ip) {
    setStatus("approximate lock", "warn");
    return;
  }

  setStatus("searching", navigator.onLine ? "warn" : "bad");
}

async function boot() {
  resizeCanvas();
  requestAnimationFrame(animate);

  await detectPermission();
  await loadMeta();
  await getPreciseLocation();

  updateClocks();
  updateInfo();
  updateStatus();

  setInterval(() => {
    updateClocks();
    updateInfo();
    updateStatus();
  }, 1000);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);

boot();
