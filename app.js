const utcTime = document.getElementById("utc-time");
const sessionState = document.getElementById("session-state");
const transportState = document.getElementById("transport-state");
const onlineState = document.getElementById("online-state");
const browserEngine = document.getElementById("browser-engine");
const cpuThreads = document.getElementById("cpu-threads");
const deviceMemory = document.getElementById("device-memory");
const riskState = document.getElementById("risk-state");
const protocolNote = document.getElementById("protocol-note");

const sessionData = document.getElementById("session-data");
const displayData = document.getElementById("display-data");
const networkData = document.getElementById("network-data");
const capabilityData = document.getElementById("capability-data");
const incidentFeed = document.getElementById("incident-feed");

const incidentLog = [];

function safeValue(value, fallback = "UNAVAILABLE") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function addLog(title, desc) {
  const time = new Date().toISOString().slice(11, 19) + "Z";
  incidentLog.unshift({ time, title, desc });
  incidentLog.splice(8);
  renderLogs();
}

function renderLogs() {
  incidentFeed.innerHTML = incidentLog
    .map(
      (item) => `
        <li>
          <span class="feed-time">${item.time}</span>
          <div>
            <div class="feed-title">${item.title}</div>
            <div class="feed-desc">${item.desc}</div>
          </div>
        </li>
      `
    )
    .join("");
}

function renderRows(container, rows) {
  container.innerHTML = rows
    .map(
      (row) => `
        <div class="data-row">
          <div class="data-key">${row.key}</div>
          <div class="data-value">${row.value}</div>
        </div>
      `
    )
    .join("");
}

function getBrowserEngine(userAgent) {
  if (/Firefox\//i.test(userAgent)) return "GECKO";
  if (/Edg\//i.test(userAgent)) return "BLINK / EDGE";
  if (/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent)) return "BLINK / CHROME";
  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) return "WEBKIT / SAFARI";
  return "UNKNOWN";
}

function updateClock() {
  const time = new Date().toISOString().slice(11, 19);
  utcTime.textContent = `${time} UTC`;
}

function updateCoreStates() {
  const ua = navigator.userAgent || "";
  const engine = getBrowserEngine(ua);

  sessionState.textContent = document.visibilityState === "visible" ? "ACTIVE" : "BACKGROUND";
  transportState.textContent = location.protocol === "https:" ? "SECURE" : "INSECURE";
  onlineState.textContent = navigator.onLine ? "ONLINE" : "OFFLINE";
  onlineState.classList.toggle("ok", navigator.onLine);
  browserEngine.textContent = engine;
  cpuThreads.textContent = safeValue(navigator.hardwareConcurrency, "UNKNOWN");
  deviceMemory.textContent = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "UNAVAILABLE";
  protocolNote.textContent = location.protocol.toUpperCase().replace(":", "");

  riskState.textContent = navigator.onLine ? "LOW" : "ELEVATED";
  riskState.classList.toggle("ok", navigator.onLine);
}

function updateTelemetry() {
  const ua = navigator.userAgent || "";
  const platform =
    navigator.userAgentData?.platform ||
    navigator.platform ||
    "UNAVAILABLE";

  const viewport = `${window.innerWidth} × ${window.innerHeight}`;
  const screenSize = `${window.screen.width} × ${window.screen.height}`;
  const availableScreen = `${window.screen.availWidth} × ${window.screen.availHeight}`;

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  const sessionRows = [
    { key: "User Agent", value: safeValue(ua) },
    { key: "Platform", value: safeValue(platform) },
    { key: "Vendor", value: safeValue(navigator.vendor) },
    { key: "Language", value: safeValue(navigator.language) },
    { key: "Languages", value: Array.isArray(navigator.languages) ? navigator.languages.join(", ") : "UNAVAILABLE" },
    { key: "Timezone", value: safeValue(Intl.DateTimeFormat().resolvedOptions().timeZone) },
    { key: "Cookie Enabled", value: navigator.cookieEnabled ? "YES" : "NO" },
    { key: "Do Not Track", value: safeValue(navigator.doNotTrack, "UNSET") },
    { key: "PDF Viewer", value: navigator.pdfViewerEnabled ? "AVAILABLE" : "UNAVAILABLE" },
    { key: "Java Enabled", value: typeof navigator.javaEnabled === "function" ? (navigator.javaEnabled() ? "YES" : "NO") : "UNAVAILABLE" }
  ];

  const displayRows = [
    { key: "Viewport", value: viewport },
    { key: "Screen", value: screenSize },
    { key: "Available Screen", value: availableScreen },
    { key: "Pixel Ratio", value: safeValue(window.devicePixelRatio) },
    { key: "Color Depth", value: safeValue(window.screen.colorDepth) },
    { key: "Pixel Depth", value: safeValue(window.screen.pixelDepth) },
    { key: "Touch Points", value: safeValue(navigator.maxTouchPoints, "0") },
    { key: "Orientation", value: safeValue(window.screen.orientation?.type) },
    { key: "Viewport Scale", value: window.visualViewport ? `${window.visualViewport.scale}` : "UNAVAILABLE" }
  ];

  const networkRows = [
    { key: "Protocol", value: location.protocol.toUpperCase() },
    { key: "Host", value: location.host },
    { key: "Path", value: location.pathname },
    { key: "Online", value: navigator.onLine ? "YES" : "NO" },
    { key: "Effective Type", value: safeValue(connection?.effectiveType) },
    { key: "Downlink", value: connection?.downlink ? `${connection.downlink} Mbps` : "UNAVAILABLE" },
    { key: "RTT", value: connection?.rtt ? `${connection.rtt} ms` : "UNAVAILABLE" },
    { key: "Save Data", value: connection?.saveData === true ? "ENABLED" : "DISABLED / UNAVAILABLE" },
    { key: "Referrer", value: document.referrer || "DIRECT / NONE" }
  ];

  const capabilityRows = [
    { key: "Local Storage", value: testStorage("localStorage") },
    { key: "Session Storage", value: testStorage("sessionStorage") },
    { key: "IndexedDB", value: "indexedDB" in window ? "AVAILABLE" : "UNAVAILABLE" },
    { key: "Service Worker", value: "serviceWorker" in navigator ? "SUPPORTED" : "UNSUPPORTED" },
    { key: "Clipboard API", value: navigator.clipboard ? "SUPPORTED" : "UNSUPPORTED" },
    { key: "Share API", value: navigator.share ? "SUPPORTED" : "UNSUPPORTED" },
    { key: "Beacon API", value: navigator.sendBeacon ? "SUPPORTED" : "UNSUPPORTED" },
    { key: "WebSocket", value: "WebSocket" in window ? "SUPPORTED" : "UNSUPPORTED" },
    { key: "WebRTC", value: "RTCPeerConnection" in window ? "SUPPORTED" : "UNSUPPORTED" },
    { key: "Geolocation", value: "BLOCKED BY PAGE POLICY" }
  ];

  renderRows(sessionData, sessionRows);
  renderRows(displayData, displayRows);
  renderRows(networkData, networkRows);
  renderRows(capabilityData, capabilityRows);
}

function testStorage(type) {
  try {
    const storage = window[type];
    const key = "__r448461_test__";
    storage.setItem(key, "1");
    storage.removeItem(key);
    return "AVAILABLE";
  } catch {
    return "UNAVAILABLE";
  }
}

async function updateBatteryInfo() {
  if (!("getBattery" in navigator)) {
    addLog("Battery telemetry unavailable", "Battery Status API not exposed in this environment.");
    return;
  }

  try {
    const battery = await navigator.getBattery();
    addLog(
      "Battery telemetry acquired",
      `Level ${Math.round(battery.level * 100)}%, charging ${battery.charging ? "yes" : "no"}.`
    );
  } catch {
    addLog("Battery telemetry failed", "Battery status could not be read.");
  }
}

function updatePermissionsSummary() {
  if (!("permissions" in navigator) || typeof navigator.permissions.query !== "function") {
    addLog("Permissions interface unavailable", "Navigator permissions query not supported.");
    return;
  }

  const names = ["notifications", "clipboard-read"];
  Promise.allSettled(
    names.map((name) => navigator.permissions.query({ name }))
  ).then((results) => {
    const summary = results
      .map((result, index) => {
        if (result.status === "fulfilled") {
          return `${names[index]}=${result.value.state}`;
        }
        return `${names[index]}=unsupported`;
      })
      .join(", ");

    addLog("Permission state snapshot", summary);
  });
}

function bootLogs() {
  addLog("Telemetry interface initialized", "Passive browser diagnostics console rendered.");
  addLog("Client runtime detected", `${navigator.onLine ? "online" : "offline"} state confirmed.`);
  addLog("Viewport telemetry captured", `${window.innerWidth}x${window.innerHeight} active viewport registered.`);
}

window.addEventListener("online", () => {
  updateCoreStates();
  updateTelemetry();
  addLog("Transport state changed", "Client reported online state.");
});

window.addEventListener("offline", () => {
  updateCoreStates();
  updateTelemetry();
  addLog("Transport state changed", "Client reported offline state.");
});

window.addEventListener("resize", () => {
  updateTelemetry();
});

document.addEventListener("visibilitychange", () => {
  updateCoreStates();
  addLog(
    "Visibility state changed",
    `Document now ${document.visibilityState}.`
  );
});

updateClock();
updateCoreStates();
updateTelemetry();
bootLogs();
updateBatteryInfo();
updatePermissionsSummary();

setInterval(updateClock, 1000);
setInterval(updateCoreStates, 5000);
setInterval(updateTelemetry, 10000);
