const summaryEl = document.getElementById("summary");
const eventsEl = document.getElementById("events");
const terminalEl = document.getElementById("terminal");
const statusEl = document.getElementById("status");
const modeLabelEl = document.getElementById("modeLabel");
const filterLabelEl = document.getElementById("filterLabel");
const viewToggleBtn = document.getElementById("viewToggle");
const filterToggleBtn = document.getElementById("filterToggle");

const state = {
  rawView: false,
  showAllFields: false
};

let snapshot = null;

function setText(el, lines) {
  el.textContent = Array.isArray(lines) ? lines.join("\n") : String(lines ?? "");
}

function pad(label, width = 26) {
  return `${label}:`.padEnd(width, " ");
}

function line(label, value) {
  return `${pad(label)}${value ?? "n/a"}`;
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

function detectBrowserClass(ua) {
  const s = String(ua || "");
  if (/Edg\//i.test(s)) return "EDGE";
  if (/OPR\//i.test(s) || /Opera/i.test(s)) return "OPERA";
  if (/Chrome\//i.test(s) && !/Edg\//i.test(s)) return "CHROMIUM";
  if (/Firefox\//i.test(s)) return "FIREFOX";
  if (/Safari\//i.test(s) && /Version\//i.test(s)) return "SAFARI";
  return "UNKNOWN";
}

function detectDeviceClass() {
  const width = Math.min(screen.width || 0, screen.height || 0);
  const touch = navigator.maxTouchPoints || 0;

  if (touch > 0 && width <= 480) return "MOBILE";
  if (touch > 0 && width <= 1024) return "TABLET";
  return "DESKTOP";
}

function detectAddressFamily(ip) {
  const value = String(ip || "");
  if (value.includes(":")) return "IPV6";
  if (value.includes(".")) return "IPV4";
  return "UNKNOWN";
}

function detectWebRtcPosture(candidates) {
  if (!Array.isArray(candidates) || !candidates.length) return "BLOCKED";
  if (candidates.some((v) => String(v).includes(".local"))) return "MASKED";
  if (candidates.some((v) => /\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(String(v)))) return "EXPOSED";
  if (candidates.some((v) => String(v).includes(":"))) return "EXPOSED";
  return "LIMITED";
}

function detectTimezoneAlignment(edgeTz, browserTz) {
  if (!edgeTz || !browserTz || edgeTz === "n/a" || browserTz === "n/a") return "UNKNOWN";
  return edgeTz === browserTz ? "MATCH" : "MISMATCH";
}

function detectSignalCoverage(data) {
  let missing = 0;

  const checks = [
    data.netmeta?.ip,
    data.netmeta?.country,
    data.netmeta?.asn,
    data.conn ? "ok" : null,
    data.battery ? "ok" : null,
    data.uaHints ? "ok" : null,
    data.webgl?.supported ? "ok" : null,
    data.iceHints?.length ? "ok" : null,
    navigator.deviceMemory || null
  ];

  for (const v of checks) {
    if (!v) missing += 1;
  }

  if (missing <= 2) return "HIGH";
  if (missing <= 5) return "MODERATE";
  return "LIMITED";
}

function shouldHideValue(value) {
  if (state.showAllFields) return false;
  return value === "n/a" || value === "unavailable" || value === "unsupported";
}

function buildEntries(data) {
  const browserTz = safe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const edgeTz = safe(data.netmeta?.timezone);
  const browserClass = detectBrowserClass(navigator.userAgent);
  const deviceClass = detectDeviceClass();
  const addressFamily = detectAddressFamily(data.netmeta?.ip);
  const webRtcPosture = detectWebRtcPosture(data.iceHints);
  const tzAlignment = detectTimezoneAlignment(edgeTz, browserTz);
  const coverage = detectSignalCoverage(data);

  return {
    derived: {
      browserClass,
      deviceClass,
      addressFamily,
      webRtcPosture,
      tzAlignment,
      coverage
    },

    summary: [
      line("EDGE STATUS", data.netmeta ? "LIVE [OK]" : "OFFLINE [FAIL]"),
      line("SOURCE ADDRESS", `${safe(data.netmeta?.ip)} [${addressFamily}]`),
      line("EDGE LINK", `${safe(data.netmeta?.colo)} / ${safe(data.netmeta?.httpProtocol)} [OK]`),
      line(
        "EDGE GEO",
        `${safe(data.netmeta?.city)}, ${safe(data.netmeta?.region)}, ${safe(data.netmeta?.country)}`
      ),
      line("CLIENT CLASS", `${browserClass} / ${deviceClass}`),
      line("SIGNAL COVERAGE", coverage),
      line("TZ ALIGNMENT", tzAlignment),
      line("WEBRTC POSTURE", webRtcPosture),
      line("GPU PATH", data.webgl?.supported ? "WEBGL [OK]" : "UNAVAILABLE"),
      line("SCAN MODE", state.rawView ? "RAW" : "OPERATOR")
    ],

    events: [
      `INIT EDGE CHANNEL..................${data.netmeta ? "OK" : "FAIL"}`,
      `RESOLVE SOURCE ADDRESS............${data.netmeta?.ip ? "OK" : "FAIL"}`,
      `MAP EDGE GEO......................${data.netmeta?.country ? "OK" : "LIMITED"}`,
      `ENUM CLIENT RUNTIME...............OK`,
      `PROBE NETWORK HINTS...............${data.conn ? "OK" : "LIMITED"}`,
      `QUERY POWER PROFILE...............${data.battery ? "OK" : "UNAVAILABLE"}`,
      `ENUM MEDIA DEVICES................${data.mediaInfo ? "OK" : "LIMITED"}`,
      `ACQUIRE GPU PATH..................${data.webgl?.supported ? "OK" : "LIMITED"}`,
      `INSPECT WEBRTC HOSTS..............${webRtcPosture}`,
      `ALIGN CLIENT EDGE TZ..............${tzAlignment}`
    ],

    operatorSections: [
      {
        title: "LINK",
        rows: [
          ["SOURCE ADDRESS", safe(data.netmeta?.ip)],
          ["ADDRESS FAMILY", addressFamily],
          ["EDGE COLO", safe(data.netmeta?.colo)],
          ["HTTP PROTOCOL", safe(data.netmeta?.httpProtocol)],
          ["TLS VERSION", safe(data.netmeta?.tlsVersion)],
          ["CF RAY", safe(data.netmeta?.rayId)]
        ]
      },
      {
        title: "EDGE",
        rows: [
          ["COUNTRY", safe(data.netmeta?.country)],
          ["REGION", safe(data.netmeta?.region)],
          ["CITY", safe(data.netmeta?.city)],
          ["POSTAL", safe(data.netmeta?.postalCode)],
          ["TIMEZONE", edgeTz],
          ["ASN", safe(data.netmeta?.asn)],
          ["ASN ORG", safe(data.netmeta?.asOrganization)]
        ]
      },
      {
        title: "CLIENT",
        rows: [
          ["BROWSER CLASS", browserClass],
          ["DEVICE CLASS", deviceClass],
          ["USER AGENT", navigator.userAgent],
          ["PLATFORM", safe(navigator.platform)],
          ["LANGUAGE", safe(navigator.language)],
          ["BROWSER TZ", browserTz],
          ["WEB DRIVER", bool(navigator.webdriver)]
        ]
      },
      {
        title: "SURFACE",
        rows: [
          ["VIEWPORT", `${window.innerWidth} x ${window.innerHeight}`],
          ["SCREEN", `${screen.width} x ${screen.height}`],
          ["PIXEL RATIO", safe(window.devicePixelRatio)],
          ["COLOR DEPTH", safe(screen.colorDepth)],
          ["ORIENTATION", safe(screen.orientation?.type)],
          ["DARK MODE", mediaQuery("(prefers-color-scheme: dark)")],
          ["HOVER", mediaQuery("(hover: hover)")]
        ]
      }
    ],

    rawSections: [
      {
        title: "REQUEST",
        rows: [
          ["TIMESTAMP", new Date().toISOString()],
          ["URL", location.href],
          ["ORIGIN", location.origin],
          ["PROTOCOL", location.protocol.replace(":", "").toUpperCase()],
          ["HOST", location.host],
          ["PATH", location.pathname || "/"],
          ["QUERY", location.search || "n/a"],
          ["HASH", location.hash || "n/a"],
          ["REFERRER", document.referrer || "direct"],
          ["HISTORY LENGTH", history.length]
        ]
      },
      {
        title: "INTERNET",
        rows: [
          ["PUBLIC IP", safe(data.netmeta?.ip)],
          ["ADDRESS FAMILY", addressFamily],
          ["COUNTRY", safe(data.netmeta?.country)],
          ["REGION", safe(data.netmeta?.region)],
          ["REGION CODE", safe(data.netmeta?.regionCode)],
          ["CITY", safe(data.netmeta?.city)],
          ["POSTAL CODE", safe(data.netmeta?.postalCode)],
          ["LATITUDE", safe(data.netmeta?.latitude)],
          ["LONGITUDE", safe(data.netmeta?.longitude)],
          ["TIMEZONE", safe(data.netmeta?.timezone)],
          ["CONTINENT", safe(data.netmeta?.continent)],
          ["ASN", safe(data.netmeta?.asn)],
          ["ASN ORG", safe(data.netmeta?.asOrganization)],
          ["COLO", safe(data.netmeta?.colo)],
          ["HTTP PROTOCOL", safe(data.netmeta?.httpProtocol)],
          ["TLS VERSION", safe(data.netmeta?.tlsVersion)],
          ["CLIENT TCP RTT", safe(data.netmeta?.clientTcpRtt)],
          ["CLIENT QUIC RTT", safe(data.netmeta?.clientQuicRtt)],
          ["REQUEST METHOD", safe(data.netmeta?.requestMethod)],
          ["SCHEME", safe(data.netmeta?.scheme)],
          ["HOST HEADER", safe(data.netmeta?.host)],
          ["CF RAY", safe(data.netmeta?.rayId)]
        ]
      },
      {
        title: "BROWSER",
        rows: [
          ["USER AGENT", navigator.userAgent],
          ["BROWSER CLASS", browserClass],
          ["DEVICE CLASS", deviceClass],
          ["PLATFORM", safe(navigator.platform)],
          ["VENDOR", safe(navigator.vendor)],
          ["LANGUAGE", safe(navigator.language)],
          ["LANGUAGES", safe(navigator.languages)],
          ["TIMEZONE", browserTz],
          ["DO NOT TRACK", safe(navigator.doNotTrack)],
          ["PDF VIEWER", safe(navigator.pdfViewerEnabled)],
          ["HARDWARE THREADS", safe(navigator.hardwareConcurrency)],
          ["DEVICE MEMORY", navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "n/a"],
          ["MAX TOUCH POINTS", safe(navigator.maxTouchPoints)],
          ["WEBDRIVER", bool(navigator.webdriver)]
        ]
      },
      {
        title: "UA CLIENT HINTS",
        rows: data.uaHints ? [
          ["ARCHITECTURE", safe(data.uaHints.architecture)],
          ["BITNESS", safe(data.uaHints.bitness)],
          ["MODEL", safe(data.uaHints.model)],
          ["PLATFORM", safe(data.uaHints.platform)],
          ["PLATFORM VERSION", safe(data.uaHints.platformVersion)],
          ["UA FULL VERSION", safe(data.uaHints.uaFullVersion)],
          [
            "BRAND LIST",
            Array.isArray(data.uaHints.fullVersionList)
              ? data.uaHints.fullVersionList.map((x) => `${x.brand} ${x.version}`).join(", ")
              : "n/a"
          ]
        ] : [
          ["STATUS", "unavailable"]
        ]
      },
      {
        title: "DISPLAY",
        rows: [
          ["VIEWPORT", `${window.innerWidth} x ${window.innerHeight}`],
          [
            "VISUAL VIEWPORT",
            window.visualViewport
              ? `${Math.round(window.visualViewport.width)} x ${Math.round(window.visualViewport.height)}`
              : "n/a"
          ],
          ["SCREEN", `${screen.width} x ${screen.height}`],
          ["AVAIL SCREEN", `${screen.availWidth} x ${screen.availHeight}`],
          ["PIXEL RATIO", safe(window.devicePixelRatio)],
          ["COLOR DEPTH", safe(screen.colorDepth)],
          ["ORIENTATION", safe(screen.orientation?.type)],
          ["DARK MODE", mediaQuery("(prefers-color-scheme: dark)")],
          ["REDUCED MOTION", mediaQuery("(prefers-reduced-motion: reduce)")],
          ["HOVER CAPABLE", mediaQuery("(hover: hover)")],
          ["COARSE POINTER", mediaQuery("(pointer: coarse)")]
        ]
      },
      {
        title: "NETWORK HINTS",
        rows: [
          ["NAVIGATOR ONLINE", bool(navigator.onLine)],
          ["CONNECTION API", data.conn ? "available" : "unavailable"],
          ["TYPE", safe(data.conn?.type)],
          ["EFFECTIVE TYPE", safe(data.conn?.effectiveType)],
          ["DOWNLINK", data.conn?.downlink ? `${data.conn.downlink} Mb/s` : "n/a"],
          ["RTT", data.conn?.rtt ? `${data.conn.rtt} ms` : "n/a"],
          ["SAVE DATA", bool(data.conn?.saveData)]
        ]
      },
      {
        title: "TIMING",
        rows: data.navTiming ? [
          ["NAVIGATION TYPE", safe(data.navTiming.type)],
          ["NEXT HOP PROTOCOL", safe(data.navTiming.protocol)],
          ["REDIRECT COUNT", safe(data.navTiming.redirectCount)],
          ["TRANSFER SIZE", formatBytes(data.navTiming.transferSize)],
          ["ENCODED BODY SIZE", formatBytes(data.navTiming.encodedBodySize)],
          ["DECODED BODY SIZE", formatBytes(data.navTiming.decodedBodySize)],
          ["DOM COMPLETE", `${data.navTiming.domComplete} ms`],
          ["LOAD EVENT END", `${data.navTiming.loadEventEnd} ms`]
        ] : [
          ["STATUS", "unavailable"]
        ]
      },
      {
        title: "STORAGE",
        rows: [
          ["LOCAL STORAGE", bool("localStorage" in window)],
          ["SESSION STORAGE", bool("sessionStorage" in window)],
          ["INDEXED DB", bool("indexedDB" in window)],
          ["COOKIES ENABLED", bool(navigator.cookieEnabled)],
          ["QUOTA", data.storageInfo ? formatBytes(data.storageInfo.quota) : "n/a"],
          ["USAGE", data.storageInfo ? formatBytes(data.storageInfo.usage) : "n/a"]
        ]
      },
      {
        title: "PERMISSIONS",
        rows: [
          ["GEOLOCATION", safe(data.permissions.geolocation)],
          ["NOTIFICATIONS", safe(data.permissions.notifications)],
          ["CAMERA", safe(data.permissions.camera)],
          ["MICROPHONE", safe(data.permissions.microphone)],
          ["CLIPBOARD-READ", safe(data.permissions["clipboard-read"])]
        ]
      },
      {
        title: "HARDWARE / POWER",
        rows: data.battery ? [
          ["BATTERY LEVEL", safe(data.battery.level)],
          ["CHARGING", bool(data.battery.charging)],
          ["CHARGING TIME", Number.isFinite(data.battery.chargingTime) ? data.battery.chargingTime : "n/a"],
          ["DISCHARGING TIME", Number.isFinite(data.battery.dischargingTime) ? data.battery.dischargingTime : "n/a"]
        ] : [
          ["BATTERY", "unavailable"]
        ]
      },
      {
        title: "MEDIA DEVICES",
        rows: data.mediaInfo ? [
          ["TOTAL DEVICES", safe(data.mediaInfo.total)],
          ["AUDIO INPUTS", safe(data.mediaInfo.audioinput)],
          ["AUDIO OUTPUTS", safe(data.mediaInfo.audiooutput)],
          ["VIDEO INPUTS", safe(data.mediaInfo.videoinput)]
        ] : [
          ["STATUS", "unavailable"]
        ]
      },
      {
        title: "GRAPHICS",
        rows: [
          ["WEBGL", bool(data.webgl?.supported)],
          ["GPU VENDOR", safe(data.webgl?.vendor)],
          ["GPU RENDERER", safe(data.webgl?.renderer)]
        ]
      },
      {
        title: "CAPABILITIES",
        rows: Object.entries(data.capabilities).map(([key, value]) => [
          key.toUpperCase(),
          typeof value === "boolean" ? bool(value) : safe(value)
        ])
      },
      {
        title: "WEBRTC HOST HINTS",
        rows: [
          ["POSTURE", webRtcPosture],
          ["CANDIDATES", Array.isArray(data.iceHints) && data.iceHints.length ? data.iceHints.join(", ") : "none / blocked / masked"]
        ]
      }
    ]
  };
}

function renderSections(sections) {
  const lines = [];

  for (const section of sections) {
    lines.push(`[ ${section.title} ]`);

    let visibleRows = section.rows;
    if (!state.showAllFields) {
      visibleRows = visibleRows.filter(([, value]) => !shouldHideValue(value));
    }

    if (!visibleRows.length) {
      lines.push(line("STATUS", "no visible fields"));
      lines.push("");
      continue;
    }

    for (const [label, value] of visibleRows) {
      lines.push(line(label, value));
    }

    lines.push("");
  }

  return lines;
}

function updateControls() {
  modeLabelEl.textContent = state.rawView ? "RAW" : "OPERATOR";
  filterLabelEl.textContent = state.showAllFields ? "FULL" : "COMPACT";
  viewToggleBtn.textContent = state.rawView
    ? "R :: SWITCH TO OPERATOR VIEW"
    : "R :: SWITCH TO RAW VIEW";
  filterToggleBtn.textContent = state.showAllFields
    ? "F :: HIDE WEAK FIELDS"
    : "F :: SHOW ALL FIELDS";
}

function render() {
  if (!snapshot) return;

  const built = buildEntries(snapshot);

  setText(summaryEl, [
    "[ ASSESSMENT ]",
    ...built.summary,
    ""
  ]);

  setText(eventsEl, [
    "[ EVENT LOG ]",
    ...built.events,
    ""
  ]);

  const sections = state.rawView ? built.rawSections : built.operatorSections;
  setText(terminalEl, renderSections(sections));

  updateControls();

  statusEl.textContent = snapshot.netmeta ? "READY+EDGE" : "READY";
}

async function gatherSnapshot() {
  const [
    netmeta,
    storageInfo,
    battery,
    permissions,
    mediaInfo,
    uaHints,
    iceHints
  ] = await Promise.all([
    getNetMeta(),
    getStorageInfo(),
    getBatteryInfo(),
    getPermissions(),
    getMediaDeviceInfo(),
    getUAClientHints(),
    getIceHints()
  ]);

  const conn =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  return {
    netmeta,
    storageInfo,
    battery,
    permissions,
    mediaInfo,
    uaHints,
    iceHints,
    navTiming: getNavigationTiming(),
    webgl: getWebGLInfo(),
    capabilities: capabilityMap(),
    conn
  };
}

function attachEvents() {
  viewToggleBtn.addEventListener("click", () => {
    state.rawView = !state.rawView;
    render();
  });

  filterToggleBtn.addEventListener("click", () => {
    state.showAllFields = !state.showAllFields;
    render();
  });

  window.addEventListener("keydown", (event) => {
    const key = String(event.key || "").toLowerCase();

    if (key === "r") {
      state.rawView = !state.rawView;
      render();
    }

    if (key === "f") {
      state.showAllFields = !state.showAllFields;
      render();
    }
  });
}

async function boot() {
  statusEl.textContent = "SCANNING";
  attachEvents();

  try {
    snapshot = await gatherSnapshot();
    render();
  } catch (error) {
    setText(summaryEl, [
      "[ ASSESSMENT ]",
      line("EDGE STATUS", "FAIL"),
      ""
    ]);

    setText(eventsEl, [
      "[ EVENT LOG ]",
      `BOOT..............................FAIL`,
      ""
    ]);

    setText(terminalEl, [
      "[ ERROR ]",
      String(error?.message || error)
    ]);

    statusEl.textContent = "ERROR";
  }
}

boot();
