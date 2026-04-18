const terminal = document.getElementById("terminal");
const statusEl = document.getElementById("status");
const lines = [];

function render() {
  terminal.textContent = lines.join("\n");
}

function push(line = "") {
  lines.push(line);
  render();
}

function section(name) {
  push(`[ ${String(name).toUpperCase()} ]`);
}

function item(label, value) {
  const left = `${label}:`.padEnd(28, " ");
  push(`${left}${value ?? "n/a"}`);
}

function safe(value) {
  if (value === null || value === undefined || value === "") return "n/a";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "n/a";
  return String(value);
}

function bool(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "n/a";
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "n/a";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let n = bytes;

  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }

  return `${n.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

function mediaQuery(query) {
  try {
    return window.matchMedia(query).matches ? "yes" : "no";
  } catch {
    return "n/a";
  }
}

async function getJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function getNetMeta() {
  try {
    return await getJson("/netmeta");
  } catch {
    return null;
  }
}

async function getStorageInfo() {
  try {
    if (!navigator.storage?.estimate) return null;
    const estimate = await navigator.storage.estimate();
    return {
      quota: estimate.quota,
      usage: estimate.usage
    };
  } catch {
    return null;
  }
}

async function getBatteryInfo() {
  try {
    if (!("getBattery" in navigator)) return null;
    const battery = await navigator.getBattery();
    return {
      charging: battery.charging,
      level: typeof battery.level === "number"
        ? `${Math.round(battery.level * 100)}%`
        : "n/a",
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime
    };
  } catch {
    return null;
  }
}

async function getPermissions() {
  if (!navigator.permissions?.query) return {};
  const names = [
    "geolocation",
    "notifications",
    "camera",
    "microphone",
    "clipboard-read"
  ];

  const result = {};

  for (const name of names) {
    try {
      const status = await navigator.permissions.query({ name });
      result[name] = status.state;
    } catch {
      result[name] = "unsupported";
    }
  }

  return result;
}

async function getMediaDeviceInfo() {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return null;
    const devices = await navigator.mediaDevices.enumerateDevices();

    return devices.reduce(
      (acc, d) => {
        acc.total += 1;
        acc[d.kind] = (acc[d.kind] || 0) + 1;
        return acc;
      },
      { total: 0 }
    );
  } catch {
    return null;
  }
}

function getWebGLInfo() {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    if (!gl) {
      return { supported: false };
    }

    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = debug
      ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL)
      : "masked";
    const renderer = debug
      ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
      : "masked";

    return {
      supported: true,
      vendor,
      renderer
    };
  } catch {
    return { supported: false };
  }
}

async function getUAClientHints() {
  try {
    if (!navigator.userAgentData?.getHighEntropyValues) return null;

    return await navigator.userAgentData.getHighEntropyValues([
      "architecture",
      "bitness",
      "model",
      "platform",
      "platformVersion",
      "uaFullVersion",
      "fullVersionList"
    ]);
  } catch {
    return null;
  }
}

async function getIceHints(timeoutMs = 1800) {
  const RTC =
    window.RTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection;

  if (!RTC) return [];

  return new Promise((resolve) => {
    const seen = new Set();
    let done = false;
    let pc;

    const finish = () => {
      if (done) return;
      done = true;
      try {
        pc?.close();
      } catch {}
      resolve(Array.from(seen));
    };

    const addValue = (value) => {
      if (!value) return;
      seen.add(String(value));
    };

    const extract = (candidate) => {
      if (!candidate) return;

      if (candidate.address) addValue(candidate.address);

      const raw = candidate.candidate || "";
      const matches = raw.match(
        /([a-f0-9]{0,4}:[a-f0-9:]+)|(\b\d{1,3}(?:\.\d{1,3}){3}\b)|([a-z0-9-]+\.local)/gi
      );

      if (matches) {
        for (const match of matches) addValue(match);
      }
    };

    try {
      pc = new RTC({ iceServers: [] });
      pc.createDataChannel("scan");

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          extract(event.candidate);
        } else {
          finish();
        }
      };

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(finish);

      setTimeout(finish, timeoutMs);
    } catch {
      resolve([]);
    }
  });
}

function getNavigationTiming() {
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    if (!nav) return null;

    return {
      type: nav.type,
      protocol: nav.nextHopProtocol || "n/a",
      redirectCount: nav.redirectCount,
      transferSize: nav.transferSize,
      encodedBodySize: nav.encodedBodySize,
      decodedBodySize: nav.decodedBodySize,
      domComplete: Math.round(nav.domComplete),
      loadEventEnd: Math.round(nav.loadEventEnd)
    };
  } catch {
    return null;
  }
}

function capabilityMap() {
  return {
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    webdriver: navigator.webdriver,
    javaScriptEnabled: true,
    localStorage: "localStorage" in window,
    sessionStorage: "sessionStorage" in window,
    indexedDB: "indexedDB" in window,
    serviceWorker: "serviceWorker" in navigator,
    sharedWorker: "SharedWorker" in window,
    webSocket: "WebSocket" in window,
    webRTC:
      "RTCPeerConnection" in window ||
      "webkitRTCPeerConnection" in window,
    geolocation: "geolocation" in navigator,
    bluetooth: "bluetooth" in navigator,
    usb: "usb" in navigator,
    serial: "serial" in navigator,
    hid: "hid" in navigator,
    clipboard: "clipboard" in navigator,
    share: "share" in navigator,
    canHover: mediaQuery("(hover: hover)") === "yes",
    coarsePointer: mediaQuery("(pointer: coarse)") === "yes",
    reducedMotion: mediaQuery("(prefers-reduced-motion: reduce)") === "yes",
    darkMode: mediaQuery("(prefers-color-scheme: dark)") === "yes"
  };
}

async function boot() {
  statusEl.textContent = "scanning";

  push("VISITOR NETWORK / BROWSER TELEMETRY");
  push("========================================================================");
  push("");

  section("request");
  item("timestamp", new Date().toISOString());
  item("url", location.href);
  item("origin", location.origin);
  item("protocol", location.protocol.replace(":", "").toUpperCase());
  item("host", location.host);
  item("path", location.pathname || "/");
  item("query", location.search || "n/a");
  item("hash", location.hash || "n/a");
  item("referrer", document.referrer || "direct");
  item("history length", history.length);
  push("");

  const netmeta = await getNetMeta();

  section("internet");
  item("public ip", safe(netmeta?.ip));
  item("edge metadata", netmeta ? "same-origin endpoint detected" : "unavailable");
  item("country", safe(netmeta?.country));
  item("region", safe(netmeta?.region));
  item("city", safe(netmeta?.city));
  item("postal code", safe(netmeta?.postalCode));
  item("latitude", safe(netmeta?.latitude));
  item("longitude", safe(netmeta?.longitude));
  item("timezone", safe(netmeta?.timezone));
  item("asn", safe(netmeta?.asn));
  item("asn org", safe(netmeta?.asOrganization));
  item("colo", safe(netmeta?.colo));
  item("http protocol", safe(netmeta?.httpProtocol));
  item("tls version", safe(netmeta?.tlsVersion));
  item("client tcp rtt", safe(netmeta?.clientTcpRtt));
  item("client quic rtt", safe(netmeta?.clientQuicRtt));
  push("");

  section("browser");
  item("user agent", navigator.userAgent);
  item("platform", safe(navigator.platform));
  item("vendor", safe(navigator.vendor));
  item("language", safe(navigator.language));
  item("languages", safe(navigator.languages));
  item("timezone", safe(Intl.DateTimeFormat().resolvedOptions().timeZone));
  item("do not track", safe(navigator.doNotTrack));
  item("pdf viewer", safe(navigator.pdfViewerEnabled));
  item("hardware threads", safe(navigator.hardwareConcurrency));
  item("device memory", navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "n/a");
  item("max touch points", safe(navigator.maxTouchPoints));
  item("webdriver", bool(navigator.webdriver));
  push("");

  const uaHints = await getUAClientHints();
  if (uaHints) {
    section("ua client hints");
    item("mobile", safe(navigator.userAgentData?.mobile));
    item("architecture", safe(uaHints.architecture));
    item("bitness", safe(uaHints.bitness));
    item("model", safe(uaHints.model));
    item("platform", safe(uaHints.platform));
    item("platform version", safe(uaHints.platformVersion));
    item("ua full version", safe(uaHints.uaFullVersion));
    item(
      "brand list",
      Array.isArray(uaHints.fullVersionList)
        ? uaHints.fullVersionList.map((x) => `${x.brand} ${x.version}`).join(", ")
        : "n/a"
    );
    push("");
  }

  section("display");
  item("viewport", `${window.innerWidth} x ${window.innerHeight}`);
  item(
    "visual viewport",
    window.visualViewport
      ? `${Math.round(window.visualViewport.width)} x ${Math.round(window.visualViewport.height)}`
      : "n/a"
  );
  item("screen", `${screen.width} x ${screen.height}`);
  item("avail screen", `${screen.availWidth} x ${screen.availHeight}`);
  item("pixel ratio", safe(window.devicePixelRatio));
  item("color depth", safe(screen.colorDepth));
  item("orientation", safe(screen.orientation?.type));
  item("dark mode", mediaQuery("(prefers-color-scheme: dark)"));
  item("reduced motion", mediaQuery("(prefers-reduced-motion: reduce)"));
  item("hover capable", mediaQuery("(hover: hover)"));
  item("coarse pointer", mediaQuery("(pointer: coarse)"));
  push("");

  section("network hints");
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  item("navigator online", bool(navigator.onLine));
  item("connection api", conn ? "available" : "unavailable");
  if (conn) {
    item("type", safe(conn.type));
    item("effective type", safe(conn.effectiveType));
    item("downlink", conn.downlink ? `${conn.downlink} Mb/s` : "n/a");
    item("rtt", conn.rtt ? `${conn.rtt} ms` : "n/a");
    item("save data", bool(conn.saveData));
  }
  push("");

  section("timing");
  const navTiming = getNavigationTiming();
  if (navTiming) {
    item("navigation type", safe(navTiming.type));
    item("next hop protocol", safe(navTiming.protocol));
    item("redirect count", safe(navTiming.redirectCount));
    item("transfer size", formatBytes(navTiming.transferSize));
    item("encoded body size", formatBytes(navTiming.encodedBodySize));
    item("decoded body size", formatBytes(navTiming.decodedBodySize));
    item("dom complete", `${navTiming.domComplete} ms`);
    item("load event end", `${navTiming.loadEventEnd} ms`);
  } else {
    item("timing", "unavailable");
  }
  push("");

  section("storage");
  const storageInfo = await getStorageInfo();
  item("localStorage", bool("localStorage" in window));
  item("sessionStorage", bool("sessionStorage" in window));
  item("indexedDB", bool("indexedDB" in window));
  item("cookies enabled", bool(navigator.cookieEnabled));
  item("quota", storageInfo ? formatBytes(storageInfo.quota) : "n/a");
  item("usage", storageInfo ? formatBytes(storageInfo.usage) : "n/a");
  push("");

  section("permissions");
  const perms = await getPermissions();
  item("geolocation", safe(perms.geolocation));
  item("notifications", safe(perms.notifications));
  item("camera", safe(perms.camera));
  item("microphone", safe(perms.microphone));
  item("clipboard-read", safe(perms["clipboard-read"]));
  push("");

  section("hardware / power");
  const battery = await getBatteryInfo();
  if (battery) {
    item("battery level", safe(battery.level));
    item("charging", bool(battery.charging));
    item(
      "charging time",
      Number.isFinite(battery.chargingTime) ? battery.chargingTime : "n/a"
    );
    item(
      "discharging time",
      Number.isFinite(battery.dischargingTime) ? battery.dischargingTime : "n/a"
    );
  } else {
    item("battery", "unavailable");
  }
  push("");

  section("media devices");
  const mediaInfo = await getMediaDeviceInfo();
  if (mediaInfo) {
    item("total devices", safe(mediaInfo.total));
    item("audio inputs", safe(mediaInfo.audioinput));
    item("audio outputs", safe(mediaInfo.audiooutput));
    item("video inputs", safe(mediaInfo.videoinput));
  } else {
    item("devices", "unavailable");
  }
  push("");

  section("graphics");
  const webgl = getWebGLInfo();
  item("webgl", bool(webgl.supported));
  item("gpu vendor", safe(webgl.vendor));
  item("gpu renderer", safe(webgl.renderer));
  push("");

  section("capabilities");
  const caps = capabilityMap();
  for (const [key, value] of Object.entries(caps)) {
    item(key, typeof value === "boolean" ? bool(value) : safe(value));
  }
  push("");

  section("webrtc host hints");
  const iceHints = await getIceHints();
  if (iceHints.length) {
    item("candidates", iceHints.join(", "));
  } else {
    item("candidates", "none / blocked / masked");
  }
  push("");

  statusEl.textContent = netmeta ? "ready+edge" : "ready";
}

boot().catch((error) => {
  push("");
  push("[ ERROR ]");
  push(String(error?.message || error));
  statusEl.textContent = "error";
});
