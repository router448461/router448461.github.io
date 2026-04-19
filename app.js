const state = {
  bootAt: Date.now(),
  refreshCount: 0,
  eventCount: 0,
  refreshInFlight: false,
  internetCache: null,
  internetCacheAt: 0,
  webglCache: null,
  idleIndex: 0,
  lastViewport: `${window.innerWidth}x${window.innerHeight}`,
};

const elements = {
  statusText: document.getElementById("status-text"),
  statusDot: document.getElementById("status-dot"),
  bootLine: document.getElementById("boot-line"),
  localClock: document.getElementById("local-clock"),
  utcClock: document.getElementById("utc-clock"),
  uptimeClock: document.getElementById("uptime-clock"),
  requestData: document.getElementById("request-data"),
  internetData: document.getElementById("internet-data"),
  displayData: document.getElementById("display-data"),
  browserData: document.getElementById("browser-data"),
  platformData: document.getElementById("platform-data"),
  hardwareData: document.getElementById("hardware-data"),
  storageData: document.getElementById("storage-data"),
  capabilitiesData: document.getElementById("capabilities-data"),
  runtimeData: document.getElementById("runtime-data"),
  eventFeed: document.getElementById("event-feed"),
  panels: [...document.querySelectorAll("[data-reveal]")],
};

const idleStates = ["stable", "monitoring", "resolving", "sampling", "tracking"];

const bootMessages = [
  "initializing render surface",
  "probing browser runtime",
  "sampling client telemetry",
  "building operator grid",
  "stabilizing live feed",
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (match) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[match];
  });
}

function lower(value) {
  return String(value).toLowerCase();
}

function yesNo(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "n/a";
}

function safeValue(value, fallback = "n/a") {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "string") return lower(value);
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return lower(String(value));
}

function formatNumber(value, fractionDigits = 0) {
  if (!Number.isFinite(value)) return "n/a";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "n/a";
  const units = ["b", "kb", "mb", "gb", "tb"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[index]}`;
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  if (minutes || hours || days) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

function localTimestamp() {
  return new Date().toLocaleTimeString([], { hour12: false });
}

function fullLocalTimestamp() {
  return new Date().toLocaleString([], { hour12: false });
}

function setStatus(label, tone = "info") {
  elements.statusText.textContent = lower(label);
  elements.statusDot.className = "status-dot";
  if (tone === "good") elements.statusDot.classList.add("good");
  if (tone === "warn") elements.statusDot.classList.add("warn");
  if (tone === "bad") elements.statusDot.classList.add("bad");
}

function setBootLine(text) {
  elements.bootLine.textContent = lower(text);
}

function pushEvent(message, tone = "info") {
  state.eventCount += 1;
  const row = document.createElement("div");
  row.className = `event-row ${tone}`;
  row.innerHTML = `
    <div class="event-index">#${String(state.eventCount).padStart(4, "0")}</div>
    <div class="event-time">${escapeHtml(localTimestamp())}</div>
    <div class="event-text">${escapeHtml(lower(message))}</div>
  `;
  elements.eventFeed.prepend(row);

  while (elements.eventFeed.children.length > 24) {
    elements.eventFeed.removeChild(elements.eventFeed.lastChild);
  }
}

function renderRows(target, rows) {
  target.innerHTML = rows
    .map((row) => {
      const key = row.key ?? "";
      const value = row.value ?? "n/a";
      const tone = row.tone ? ` ${row.tone}` : "";
      return `
        <div class="data-row">
          <div class="row-key">${escapeHtml(lower(key))}</div>
          <div class="row-value${tone}">${escapeHtml(lower(value))}</div>
        </div>
      `;
    })
    .join("");
}

function mediaMatch(query) {
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

function getRequestRows() {
  return [
    { key: "timestamp", value: new Date().toISOString() },
    { key: "url", value: location.href },
    { key: "origin", value: location.origin },
    { key: "protocol", value: location.protocol.replace(":", "") },
    { key: "host", value: location.host },
    { key: "path", value: location.pathname || "/" },
    { key: "query", value: location.search || "n/a" },
    { key: "hash", value: location.hash || "n/a" },
    { key: "referrer", value: document.referrer || "direct" },
    { key: "history length", value: history.length },
    { key: "visibility", value: document.visibilityState },
    { key: "focused", value: yesNo(document.hasFocus()) },
  ];
}

function getDisplayRows() {
  const screenWidth = window.screen?.width;
  const screenHeight = window.screen?.height;
  const availWidth = window.screen?.availWidth;
  const availHeight = window.screen?.availHeight;
  const orientationType =
    window.screen?.orientation?.type || window.orientation || "n/a";

  return [
    { key: "screen", value: `${screenWidth || "?"} x ${screenHeight || "?"}` },
    { key: "screen avail", value: `${availWidth || "?"} x ${availHeight || "?"}` },
    { key: "viewport", value: `${window.innerWidth} x ${window.innerHeight}` },
    { key: "pixel ratio", value: window.devicePixelRatio || 1 },
    { key: "color depth", value: window.screen?.colorDepth ?? "n/a" },
    { key: "orientation", value: orientationType },
    { key: "theme dark", value: yesNo(mediaMatch("(prefers-color-scheme: dark)")) },
    { key: "reduced motion", value: yesNo(mediaMatch("(prefers-reduced-motion: reduce)")) },
    { key: "high contrast", value: yesNo(mediaMatch("(prefers-contrast: more)")) },
    { key: "pointer fine", value: yesNo(mediaMatch("(pointer: fine)")) },
    { key: "hover", value: yesNo(mediaMatch("(hover: hover)")) },
  ];
}

function getBrowserRows() {
  return [
    { key: "user agent", value: navigator.userAgent || "n/a" },
    { key: "language", value: navigator.language || "n/a" },
    { key: "languages", value: navigator.languages?.join(", ") || "n/a" },
    { key: "platform", value: navigator.platform || "n/a" },
    { key: "vendor", value: navigator.vendor || "n/a" },
    { key: "product", value: navigator.product || "n/a" },
    { key: "cookies enabled", value: yesNo(navigator.cookieEnabled) },
    { key: "pdf viewer", value: yesNo(navigator.pdfViewerEnabled) },
    { key: "do not track", value: navigator.doNotTrack || "n/a" },
    { key: "webdriver", value: yesNo(navigator.webdriver) },
  ];
}

function getPlatformRows() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "n/a";
  const nav = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  return [
    { key: "timezone", value: tz },
    { key: "online", value: yesNo(navigator.onLine), tone: navigator.onLine ? "good" : "bad" },
    { key: "page protocol", value: location.protocol.replace(":", "") },
    { key: "standalone", value: yesNo(window.matchMedia?.("(display-mode: standalone)").matches) },
    { key: "display mode minimal", value: yesNo(window.matchMedia?.("(display-mode: minimal-ui)").matches) },
    { key: "save data", value: yesNo(nav?.saveData) },
    { key: "effective type", value: nav?.effectiveType || "n/a" },
    { key: "downlink", value: nav?.downlink ? `${nav.downlink} mbps` : "n/a" },
    { key: "rtt", value: nav?.rtt ? `${nav.rtt} ms` : "n/a" },
  ];
}

function getHardwareRows() {
  const touchCapable =
    "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

  return [
    { key: "cpu threads", value: navigator.hardwareConcurrency ?? "n/a" },
    { key: "device memory", value: navigator.deviceMemory ? `${navigator.deviceMemory} gb` : "n/a" },
    { key: "max touch points", value: navigator.maxTouchPoints ?? 0 },
    { key: "touch capable", value: yesNo(touchCapable) },
    { key: "clipboard api", value: yesNo(!!navigator.clipboard) },
    { key: "share api", value: yesNo(!!navigator.share) },
    { key: "vibrate api", value: yesNo(!!navigator.vibrate) },
    { key: "bluetooth api", value: yesNo(!!navigator.bluetooth) },
    { key: "usb api", value: yesNo(!!navigator.usb) },
    { key: "serial api", value: yesNo(!!navigator.serial) },
  ];
}

async function getStorageRows() {
  let quota = "n/a";
  let usage = "n/a";
  let persisted = "n/a";

  try {
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      quota = formatBytes(estimate.quota);
      usage = formatBytes(estimate.usage);
    }
  } catch {}

  try {
    if (navigator.storage?.persisted) {
      persisted = yesNo(await navigator.storage.persisted());
    }
  } catch {}

  return [
    { key: "localstorage", value: yesNo(storageAvailable("localStorage")) },
    { key: "sessionstorage", value: yesNo(storageAvailable("sessionStorage")) },
    { key: "indexeddb", value: yesNo(!!window.indexedDB) },
    { key: "storage quota", value: quota },
    { key: "storage usage", value: usage },
    { key: "persisted storage", value: persisted },
  ];
}

async function getWebGLInfo() {
  if (state.webglCache) return state.webglCache;

  let vendor = "n/a";
  let renderer = "n/a";
  let mode = "unavailable";

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl") ||
      canvas.getContext("webgl2");

    if (gl) {
      mode = "available";
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      vendor = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : "masked";
      renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "masked";
    }
  } catch {
    mode = "blocked";
  }

  state.webglCache = { mode, vendor, renderer };
  return state.webglCache;
}

async function getPermissionStates() {
  if (!navigator.permissions?.query) return [];

  const names = [
    "geolocation",
    "notifications",
    "camera",
    "microphone",
    "clipboard-read",
    "clipboard-write",
  ];

  const states = [];

  for (const name of names) {
    try {
      const result = await navigator.permissions.query({ name });
      states.push({ key: `perm ${name}`, value: result.state });
    } catch {}
  }

  return states;
}

async function getCapabilitiesRows() {
  const webgl = await getWebGLInfo();
  const perms = await getPermissionStates();

  const rows = [
    { key: "service worker", value: yesNo("serviceWorker" in navigator) },
    { key: "geolocation api", value: yesNo(!!navigator.geolocation) },
    { key: "media devices", value: yesNo(!!navigator.mediaDevices) },
    { key: "webgl", value: webgl.mode },
    { key: "webgl vendor", value: webgl.vendor },
    { key: "webgl renderer", value: webgl.renderer },
    { key: "wake lock", value: yesNo(!!navigator.wakeLock) },
    { key: "screen capture", value: yesNo(!!navigator.mediaDevices?.getDisplayMedia) },
    { key: "web share files", value: yesNo(!!navigator.canShare) },
  ];

  return rows.concat(perms);
}

function getRuntimeRows() {
  const navEntry = performance.getEntriesByType("navigation")[0];
  const resources = performance.getEntriesByType("resource");
  const heap = performance.memory;
  const elementsCount = document.getElementsByTagName("*").length;

  return [
    { key: "refresh cycles", value: state.refreshCount },
    { key: "page uptime", value: formatDuration(Date.now() - state.bootAt) },
    { key: "dom nodes", value: formatNumber(elementsCount) },
    { key: "resource count", value: formatNumber(resources.length) },
    { key: "navigation type", value: navEntry?.type || "n/a" },
    { key: "dom interactive", value: navEntry ? `${Math.round(navEntry.domInteractive)} ms` : "n/a" },
    { key: "dom complete", value: navEntry ? `${Math.round(navEntry.domComplete)} ms` : "n/a" },
    { key: "load event end", value: navEntry ? `${Math.round(navEntry.loadEventEnd)} ms` : "n/a" },
    {
      key: "js heap used",
      value: heap?.usedJSHeapSize ? formatBytes(heap.usedJSHeapSize) : "n/a",
    },
    {
      key: "js heap limit",
      value: heap?.jsHeapSizeLimit ? formatBytes(heap.jsHeapSizeLimit) : "n/a",
    },
  ];
}

async function timedJsonFetch(url, timeout = 3500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`http ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function getInternetRows() {
  const now = Date.now();
  if (state.internetCache && now - state.internetCacheAt < 15000) {
    return state.internetCache;
  }

  const rows = [
    { key: "public ip", value: "probing..." },
    { key: "colo", value: "probing..." },
    { key: "country", value: "probing..." },
    { key: "asn org", value: "probing..." },
    { key: "network path", value: navigator.onLine ? "reachable" : "offline", tone: navigator.onLine ? "good" : "bad" },
    { key: "dns visibility", value: "browser sandboxed", tone: "warn" },
    { key: "resolver insight", value: "not exposed by standard browser apis", tone: "warn" },
  ];

  try {
    const meta = await timedJsonFetch("https://speed.cloudflare.com/meta", 3500);

    rows[0].value = meta.clientIp || "n/a";
    rows[1].value = meta.colo || "n/a";
    rows[2].value = [meta.city, meta.region, meta.country]
      .filter(Boolean)
      .join(", ") || "n/a";
    rows[3].value = meta.asOrganization || meta.asn || "n/a";
  } catch {
    try {
      const ip = await timedJsonFetch("https://api64.ipify.org?format=json", 2500);
      rows[0].value = ip.ip || "n/a";
      rows[1].value = "unavailable";
      rows[2].value = "unavailable";
      rows[3].value = "unavailable";
    } catch {
      rows[0].value = "unavailable";
      rows[1].value = "unavailable";
      rows[2].value = "unavailable";
      rows[3].value = "unavailable";
    }
  }

  state.internetCache = rows;
  state.internetCacheAt = now;
  return rows;
}

function storageAvailable(type) {
  try {
    const storage = window[type];
    const testKey = "__router448461_probe__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function updateClocks() {
  const now = new Date();
  elements.localClock.textContent = now.toLocaleString([], { hour12: false });
  elements.utcClock.textContent = now.toUTCString().toLowerCase();
  elements.uptimeClock.textContent = formatDuration(Date.now() - state.bootAt);
}

function revealPanels() {
  elements.panels.forEach((panel, index) => {
    setTimeout(() => panel.classList.add("visible"), 120 + index * 100);
  });
}

async function refreshAll({ initial = false } = {}) {
  if (state.refreshInFlight) return;

  state.refreshInFlight = true;
  state.refreshCount += 1;

  setStatus(initial ? "collecting" : "sampling", "warn");
  setBootLine(initial ? "capturing first telemetry pass" : "refreshing live data");

  renderRows(elements.requestData, getRequestRows());
  renderRows(elements.displayData, getDisplayRows());
  renderRows(elements.browserData, getBrowserRows());
  renderRows(elements.platformData, getPlatformRows());
  renderRows(elements.hardwareData, getHardwareRows());
  renderRows(elements.runtimeData, getRuntimeRows());

  const [internetRows, storageRows, capabilitiesRows] = await Promise.all([
    getInternetRows(),
    getStorageRows(),
    getCapabilitiesRows(),
  ]);

  renderRows(elements.internetData, internetRows);
  renderRows(elements.storageData, storageRows);
  renderRows(elements.capabilitiesData, capabilitiesRows);
  renderRows(elements.runtimeData, getRuntimeRows());

  setStatus(navigator.onLine ? "stable" : "offline", navigator.onLine ? "good" : "bad");
  setBootLine(
    navigator.onLine
      ? `live cycle ${state.refreshCount} :: surface stable`
      : `live cycle ${state.refreshCount} :: network degraded`
  );

  pushEvent(
    initial
      ? "initial telemetry capture complete"
      : `telemetry refresh complete :: cycle ${state.refreshCount}`,
    navigator.onLine ? "good" : "bad"
  );

  state.refreshInFlight = false;
}

function startIdleTicker() {
  setInterval(() => {
    if (state.refreshInFlight) return;
    if (!navigator.onLine) {
      setStatus("offline", "bad");
      return;
    }

    const next = idleStates[state.idleIndex % idleStates.length];
    state.idleIndex += 1;
    const tone = next === "stable" ? "good" : "warn";
    setStatus(next, tone);
  }, 2600);
}

function startClockTicker() {
  updateClocks();
  setInterval(updateClocks, 1000);
}

function startRefreshTicker() {
  setInterval(() => {
    refreshAll();
  }, 12000);
}

async function runBoot() {
  setStatus("booting", "warn");

  for (const message of bootMessages) {
    setBootLine(message);
    pushEvent(message, "info");
    await sleep(280);
  }

  revealPanels();
  await refreshAll({ initial: true });
}

function attachEvents() {
  let resizeTimer = null;

  window.addEventListener("online", () => {
    pushEvent("network state changed :: online", "good");
    state.internetCache = null;
    refreshAll();
  });

  window.addEventListener("offline", () => {
    pushEvent("network state changed :: offline", "bad");
    setStatus("offline", "bad");
    refreshAll();
  });

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const nextViewport = `${window.innerWidth}x${window.innerHeight}`;
      if (nextViewport !== state.lastViewport) {
        state.lastViewport = nextViewport;
        pushEvent(`viewport changed :: ${window.innerWidth} x ${window.innerHeight}`, "warn");
        renderRows(elements.displayData, getDisplayRows());
        renderRows(elements.runtimeData, getRuntimeRows());
      }
    }, 120);
  });

  document.addEventListener("visibilitychange", () => {
    pushEvent(`visibility changed :: ${document.visibilityState}`, "info");
    renderRows(elements.requestData, getRequestRows());
  });

  window.addEventListener("focus", () => {
    pushEvent("window focus acquired", "good");
    renderRows(elements.requestData, getRequestRows());
  });

  window.addEventListener("blur", () => {
    pushEvent("window focus lost", "warn");
    renderRows(elements.requestData, getRequestRows());
  });

  if (navigator.connection) {
    navigator.connection.addEventListener?.("change", () => {
      pushEvent("network metrics changed", "info");
      state.internetCache = null;
      renderRows(elements.platformData, getPlatformRows());
      refreshAll();
    });
  }
}

startClockTicker();
attachEvents();
runBoot();
startIdleTicker();
startRefreshTicker();
