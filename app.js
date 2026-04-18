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

function pad(label, width = 28) {
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
  const units = ["b", "kb", "mb", "gb", "tb"];
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

function compactList(value, fallback = "n/a") {
  if (!Array.isArray(value) || !value.length) return fallback;
  return value.join(", ");
}

function lower(value) {
  return safe(value).toLowerCase();
}

async function getJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`http ${res.status}`);
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
    isSecureContext: window.isSecureContext,
    crossOriginIsolated: window.crossOriginIsolated,
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
    mediaCapabilities: "mediaCapabilities" in navigator,
    canHover: mediaQuery("(hover: hover)") === "yes",
    coarsePointer: mediaQuery("(pointer: coarse)") === "yes",
    reducedMotion: mediaQuery("(prefers-reduced-motion: reduce)") === "yes",
    darkMode: mediaQuery("(prefers-color-scheme: dark)") === "yes"
  };
}

function detectBrowserClass(ua) {
  const s = String(ua || "");
  if (/Edg\//i.test(s)) return "edge";
  if (/OPR\//i.test(s) || /Opera/i.test(s)) return "opera";
  if (/Chrome\//i.test(s) && !/Edg\//i.test(s)) return "chromium";
  if (/Firefox\//i.test(s)) return "firefox";
  if (/Safari\//i.test(s) && /Version\//i.test(s)) return "safari";
  return "unknown";
}

function detectDeviceClass() {
  const width = Math.min(screen.width || 0, screen.height || 0);
  const touch = navigator.maxTouchPoints || 0;

  if (touch > 0 && width <= 480) return "mobile";
  if (touch > 0 && width <= 1024) return "tablet";
  return "desktop";
}

function detectAddressFamily(ip) {
  const value = String(ip || "");
  if (value.includes(":")) return "ipv6";
  if (value.includes(".")) return "ipv4";
  return "unknown";
}

function detectWebRtcPosture(candidates) {
  if (!Array.isArray(candidates) || !candidates.length) return "blocked";
  if (candidates.some((v) => String(v).includes(".local"))) return "masked";
  if (candidates.some((v) => /\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(String(v)))) return "exposed";
  if (candidates.some((v) => String(v).includes(":"))) return "exposed";
  return "limited";
}

function detectTimezoneAlignment(edgeTz, browserTz) {
  if (!edgeTz || !browserTz || edgeTz === "n/a" || browserTz === "n/a") return "unknown";
  return edgeTz === browserTz ? "match" : "mismatch";
}

function detectSignalCoverage(data) {
  let missing = 0;

  const checks = [
    data.netmeta?.sourceIp,
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

  if (missing <= 2) return "high";
  if (missing <= 5) return "moderate";
  return "limited";
}

function splitCandidates(candidates) {
  const result = {
    mdns: [],
    ipv4: [],
    ipv6: [],
    other: []
  };

  if (!Array.isArray(candidates)) return result;

  for (const value of candidates) {
    const v = String(value);

    if (v.includes(".local")) {
      result.mdns.push(v);
    } else if (/\b\d{1,3}(?:\.\d{1,3}){3}\b/.test(v)) {
      result.ipv4.push(v);
    } else if (v.includes(":")) {
      result.ipv6.push(v);
    } else {
      result.other.push(v);
    }
  }

  return result;
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
  const addressFamily = detectAddressFamily(data.netmeta?.sourceIp);
  const webRtcPosture = detectWebRtcPosture(data.iceHints);
  const tzAlignment = detectTimezoneAlignment(edgeTz, browserTz);
  const coverage = detectSignalCoverage(data);
  const candidates = splitCandidates(data.iceHints);
  const dns = data.netmeta?.dns || {};

  return {
    summary: [
      line("edge status", data.netmeta ? "live / ok" : "offline / fail"),
      line("source ip", safe(data.netmeta?.sourceIp)),
      line("source family", addressFamily),
      line("ip lookup", `${safe(data.netmeta?.city)}, ${safe(data.netmeta?.region)}, ${safe(data.netmeta?.country)}`),
      line("edge link", `${safe(data.netmeta?.colo)} / ${safe(data.netmeta?.httpProtocol)}`),
      line("client class", `${browserClass} / ${deviceClass}`),
      line("signal coverage", coverage),
      line("timezone alignment", tzAlignment),
      line("webrtc posture", webRtcPosture),
      line("reverse ptr", compactList(dns.sourcePtr))
    ],

    events: [
      `init edge channel..................${data.netmeta ? "ok" : "fail"}`,
      `resolve source address............${data.netmeta?.sourceIp ? "ok" : "fail"}`,
      `map edge geo......................${data.netmeta?.country ? "ok" : "limited"}`,
      `run reverse ptr...................${Array.isArray(dns.sourcePtr) && dns.sourcePtr.length ? "ok" : "limited"}`,
      `resolve site aaaa/a...............${(dns.siteA?.length || dns.siteAAAA?.length) ? "ok" : "limited"}`,
      `enum client runtime...............ok`,
      `probe network hints...............${data.conn ? "ok" : "limited"}`,
      `query power profile...............${data.battery ? "ok" : "unavailable"}`,
      `acquire gpu path..................${data.webgl?.supported ? "ok" : "limited"}`,
      `inspect webrtc hosts..............${webRtcPosture}`
    ],

    operatorSections: [
      {
        title: "link",
        rows: [
          ["source ip", safe(data.netmeta?.sourceIp)],
          ["source ipv4", safe(data.netmeta?.sourceIpv4)],
          ["source ipv6", safe(data.netmeta?.sourceIpv6)],
          ["source family", addressFamily],
          ["edge colo", safe(data.netmeta?.colo)],
          ["http protocol", safe(data.netmeta?.httpProtocol)],
          ["tls version", safe(data.netmeta?.tlsVersion)],
          ["cf ray", safe(data.netmeta?.rayId)]
        ]
      },
      {
        title: "ip lookup",
        rows: [
          ["country", safe(data.netmeta?.country)],
          ["region", safe(data.netmeta?.region)],
          ["city", safe(data.netmeta?.city)],
          ["postal code", safe(data.netmeta?.postalCode)],
          ["latitude", safe(data.netmeta?.latitude)],
          ["longitude", safe(data.netmeta?.longitude)],
          ["timezone", safe(data.netmeta?.timezone)],
          ["asn", safe(data.netmeta?.asn)],
          ["asn org", safe(data.netmeta?.asOrganization)]
        ]
      },
      {
        title: "dns",
        rows: [
          ["source reverse ptr", compactList(dns.sourcePtr)],
          ["site hostname", safe(dns.hostname)],
          ["site ipv4", compactList(dns.siteA)],
          ["site ipv6", compactList(dns.siteAAAA)],
          ["site cname", compactList(dns.siteCNAME)],
          ["site ns", compactList(dns.siteNS)],
          ["site mx", compactList(dns.siteMX)],
          ["site txt", compactList(dns.siteTXT)],
          ["site dnssec ad", bool(dns.ad)],
          ["client dns resolver", "not exposed by browser"]
        ]
      },
      {
        title: "client",
        rows: [
          ["browser class", browserClass],
          ["device class", deviceClass],
          ["user agent", navigator.userAgent],
          ["platform", safe(navigator.platform)],
          ["language", safe(navigator.language)],
          ["browser timezone", browserTz],
          ["webdriver", bool(navigator.webdriver)]
        ]
      },
      {
        title: "network surface",
        rows: [
          ["webrtc posture", webRtcPosture],
          ["mdns host hints", compactList(candidates.mdns)],
          ["webrtc ipv4 hints", compactList(candidates.ipv4)],
          ["webrtc ipv6 hints", compactList(candidates.ipv6)],
          ["navigator online", bool(navigator.onLine)],
          ["connection api", data.conn ? "available" : "unavailable"]
        ]
      },
      {
        title: "surface",
        rows: [
          ["viewport", `${window.innerWidth} x ${window.innerHeight}`],
          ["screen", `${screen.width} x ${screen.height}`],
          ["pixel ratio", safe(window.devicePixelRatio)],
          ["color depth", safe(screen.colorDepth)],
          ["dark mode", mediaQuery("(prefers-color-scheme: dark)")],
          ["hover", mediaQuery("(hover: hover)")],
          ["coarse pointer", mediaQuery("(pointer: coarse)")]
        ]
      }
    ],

    rawSections: [
      {
        title: "request",
        rows: [
          ["timestamp", new Date().toISOString()],
          ["url", location.href],
          ["origin", location.origin],
          ["protocol", location.protocol.replace(":", "").toLowerCase()],
          ["host", location.host],
          ["path", location.pathname || "/"],
          ["query", location.search || "n/a"],
          ["hash", location.hash || "n/a"],
          ["referrer", document.referrer || "direct"],
          ["history length", history.length]
        ]
      },
      {
        title: "internet",
        rows: [
          ["source ip", safe(data.netmeta?.sourceIp)],
          ["source ipv4", safe(data.netmeta?.sourceIpv4)],
          ["source ipv6", safe(data.netmeta?.sourceIpv6)],
          ["source family", addressFamily],
          ["country", safe(data.netmeta?.country)],
          ["region", safe(data.netmeta?.region)],
          ["region code", safe(data.netmeta?.regionCode)],
          ["city", safe(data.netmeta?.city)],
          ["postal code", safe(data.netmeta?.postalCode)],
          ["latitude", safe(data.netmeta?.latitude)],
          ["longitude", safe(data.netmeta?.longitude)],
          ["timezone", safe(data.netmeta?.timezone)],
          ["continent", safe(data.netmeta?.continent)],
          ["asn", safe(data.netmeta?.asn)],
          ["asn org", safe(data.netmeta?.asOrganization)],
          ["colo", safe(data.netmeta?.colo)],
          ["http protocol", safe(data.netmeta?.httpProtocol)],
          ["tls version", safe(data.netmeta?.tlsVersion)],
          ["client tcp rtt", safe(data.netmeta?.clientTcpRtt)],
          ["client quic rtt", safe(data.netmeta?.clientQuicRtt)],
          ["request method", safe(data.netmeta?.requestMethod)],
          ["scheme", safe(data.netmeta?.scheme)],
          ["host header", safe(data.netmeta?.host)],
          ["cf ray", safe(data.netmeta?.rayId)]
        ]
      },
      {
        title: "dns",
        rows: [
          ["source reverse ptr", compactList(dns.sourcePtr)],
          ["site hostname", safe(dns.hostname)],
          ["site a", compactList(dns.siteA)],
          ["site aaaa", compactList(dns.siteAAAA)],
          ["site cname", compactList(dns.siteCNAME)],
          ["site ns", compactList(dns.siteNS)],
          ["site mx", compactList(dns.siteMX)],
          ["site txt", compactList(dns.siteTXT)],
          ["site dns status", safe(dns.status)],
          ["site dnssec ad", bool(dns.ad)],
          ["client dns resolver", "not exposed by browser"]
        ]
      },
      {
        title: "browser",
        rows: [
          ["user agent", navigator.userAgent],
          ["browser class", browserClass],
          ["device class", deviceClass],
          ["platform", safe(navigator.platform)],
          ["vendor", safe(navigator.vendor)],
          ["language", safe(navigator.language)],
          ["languages", safe(navigator.languages)],
          ["timezone", browserTz],
          ["do not track", safe(navigator.doNotTrack)],
          ["pdf viewer", safe(navigator.pdfViewerEnabled)],
          ["hardware threads", safe(navigator.hardwareConcurrency)],
          ["device memory", navigator.deviceMemory ? `${navigator.deviceMemory} gb` : "n/a"],
          ["max touch points", safe(navigator.maxTouchPoints)],
          ["webdriver", bool(navigator.webdriver)],
          ["plugin count", safe(navigator.plugins?.length)],
          ["mime type count", safe(navigator.mimeTypes?.length)]
        ]
      },
      {
        title: "ua client hints",
        rows: data.uaHints ? [
          ["architecture", safe(data.uaHints.architecture)],
          ["bitness", safe(data.uaHints.bitness)],
          ["model", safe(data.uaHints.model)],
          ["platform", safe(data.uaHints.platform)],
          ["platform version", safe(data.uaHints.platformVersion)],
          ["ua full version", safe(data.uaHints.uaFullVersion)],
          [
            "brand list",
            Array.isArray(data.uaHints.fullVersionList)
              ? data.uaHints.fullVersionList.map((x) => `${x.brand} ${x.version}`).join(", ")
              : "n/a"
          ]
        ] : [
          ["status", "unavailable"]
        ]
      },
      {
        title: "display",
        rows: [
          ["viewport", `${window.innerWidth} x ${window.innerHeight}`],
          [
            "visual viewport",
            window.visualViewport
              ? `${Math.round(window.visualViewport.width)} x ${Math.round(window.visualViewport.height)}`
              : "n/a"
          ],
          ["screen", `${screen.width} x ${screen.height}`],
          ["avail screen", `${screen.availWidth} x ${screen.availHeight}`],
          ["pixel ratio", safe(window.devicePixelRatio)],
          ["color depth", safe(screen.colorDepth)],
          ["orientation", safe(screen.orientation?.type)],
          ["dark mode", mediaQuery("(prefers-color-scheme: dark)")],
          ["reduced motion", mediaQuery("(prefers-reduced-motion: reduce)")],
          ["hover capable", mediaQuery("(hover: hover)")],
          ["coarse pointer", mediaQuery("(pointer: coarse)")]
        ]
      },
      {
        title: "network hints",
        rows: [
          ["navigator online", bool(navigator.onLine)],
          ["connection api", data.conn ? "available" : "unavailable"],
          ["type", safe(data.conn?.type)],
          ["effective type", safe(data.conn?.effectiveType)],
          ["downlink", data.conn?.downlink ? `${data.conn.downlink} mb/s` : "n/a"],
          ["rtt", data.conn?.rtt ? `${data.conn.rtt} ms` : "n/a"],
          ["save data", bool(data.conn?.saveData)]
        ]
      },
      {
        title: "timing",
        rows: data.navTiming ? [
          ["navigation type", safe(data.navTiming.type)],
          ["next hop protocol", safe(data.navTiming.protocol)],
          ["redirect count", safe(data.navTiming.redirectCount)],
          ["transfer size", formatBytes(data.navTiming.transferSize)],
          ["encoded body size", formatBytes(data.navTiming.encodedBodySize)],
          ["decoded body size", formatBytes(data.navTiming.decodedBodySize)],
          ["dom complete", `${data.navTiming.domComplete} ms`],
          ["load event end", `${data.navTiming.loadEventEnd} ms`]
        ] : [
          ["status", "unavailable"]
        ]
      },
      {
        title: "storage",
        rows: [
          ["local storage", bool("localStorage" in window)],
          ["session storage", bool("sessionStorage" in window)],
          ["indexed db", bool("indexedDB" in window)],
          ["cookies enabled", bool(navigator.cookieEnabled)],
          ["quota", data.storageInfo ? formatBytes(data.storageInfo.quota) : "n/a"],
          ["usage", data.storageInfo ? formatBytes(data.storageInfo.usage) : "n/a"]
        ]
      },
      {
        title: "permissions",
        rows: [
          ["geolocation", safe(data.permissions.geolocation)],
          ["notifications", safe(data.permissions.notifications)],
          ["camera", safe(data.permissions.camera)],
          ["microphone", safe(data.permissions.microphone)],
          ["clipboard-read", safe(data.permissions["clipboard-read"])]
        ]
      },
      {
        title: "hardware and power",
        rows: data.battery ? [
          ["battery level", safe(data.battery.level)],
          ["charging", bool(data.battery.charging)],
          ["charging time", Number.isFinite(data.battery.chargingTime) ? data.battery.chargingTime : "n/a"],
          ["discharging time", Number.isFinite(data.battery.dischargingTime) ? data.battery.dischargingTime : "n/a"]
        ] : [
          ["battery", "unavailable"]
        ]
      },
      {
        title: "media devices",
        rows: data.mediaInfo ? [
          ["total devices", safe(data.mediaInfo.total)],
          ["audio inputs", safe(data.mediaInfo.audioinput)],
          ["audio outputs", safe(data.mediaInfo.audiooutput)],
          ["video inputs", safe(data.mediaInfo.videoinput)]
        ] : [
          ["status", "unavailable"]
        ]
      },
      {
        title: "graphics",
        rows: [
          ["webgl", bool(data.webgl?.supported)],
          ["gpu vendor", safe(data.webgl?.vendor)],
          ["gpu renderer", safe(data.webgl?.renderer)]
        ]
      },
      {
        title: "capabilities",
        rows: Object.entries(data.capabilities).map(([key, value]) => [
          key.replace(/[A-Z]/g, (m) => ` ${m.toLowerCase()}`).trim(),
          typeof value === "boolean" ? bool(value) : safe(value)
        ])
      },
      {
        title: "webrtc host hints",
        rows: [
          ["posture", webRtcPosture],
          ["mdns host hints", compactList(candidates.mdns)],
          ["ipv4 hints", compactList(candidates.ipv4)],
          ["ipv6 hints", compactList(candidates.ipv6)],
          ["other hints", compactList(candidates.other)],
          ["all candidates", Array.isArray(data.iceHints) && data.iceHints.length ? data.iceHints.join(", ") : "none / blocked / masked"]
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
      lines.push(line("status", "no visible fields"));
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
  modeLabelEl.textContent = state.rawView ? "raw" : "operator";
  filterLabelEl.textContent = state.showAllFields ? "full" : "compact";

  viewToggleBtn.textContent = state.rawView
    ? "switch to operator view"
    : "switch to raw view";

  filterToggleBtn.textContent = state.showAllFields
    ? "hide weak fields"
    : "show all fields";
}

function render() {
  if (!snapshot) return;

  const built = buildEntries(snapshot);

  setText(summaryEl, [
    "[ assessment ]",
    ...built.summary,
    ""
  ]);

  setText(eventsEl, [
    "[ event log ]",
    ...built.events,
    ""
  ]);

  const sections = state.rawView ? built.rawSections : built.operatorSections;
  setText(terminalEl, renderSections(sections));

  updateControls();
  statusEl.textContent = snapshot.netmeta ? "ready+edge" : "ready";
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
}

async function boot() {
  statusEl.textContent = "scanning";
  attachEvents();

  try {
    snapshot = await gatherSnapshot();
    render();
  } catch (error) {
    setText(summaryEl, [
      "[ assessment ]",
      line("edge status", "fail"),
      ""
    ]);

    setText(eventsEl, [
      "[ event log ]",
      "boot..............................fail",
      ""
    ]);

    setText(terminalEl, [
      "[ error ]",
      String(error?.message || error)
    ]);

    statusEl.textContent = "error";
  }
}

boot();
