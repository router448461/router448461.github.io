const terminal = document.getElementById("terminal");
const statusEl = document.getElementById("status");
const lines = [];

function push(line = "") {
  lines.push(line);
  terminal.textContent = lines.join("\n");
}

function item(label, value) {
  const left = `${label}:`.padEnd(24, " ");
  push(left + (value ?? "n/a"));
}

function safe(v) {
  if (v === null || v === undefined || v === "") return "n/a";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "n/a";
  return String(v);
}

function yesNo(v) {
  if (v === true) return "yes";
  if (v === false) return "no";
  return "n/a";
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

async function getPublicIp() {
  try {
    return await getJson("https://api64.ipify.org?format=json");
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

    if (!gl) return { supported: false };

    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      supported: true,
      vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : "masked",
      renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "masked"
    };
  } catch {
    return { supported: false };
  }
}

async function boot() {
  statusEl.textContent = "scanning";

  push("visitor telemetry");
  push("");

  item("time", new Date().toISOString());
  item("url", location.href);
  item("referrer", document.referrer || "direct");
  item("host", location.host);
  item("path", location.pathname || "/");
  push("");

  const [netmeta, publicIp] = await Promise.all([
    getNetMeta(),
    getPublicIp()
  ]);

  push("[ internet ]");
  item("public ip", netmeta?.ip || publicIp?.ip || "unavailable");
  item("country", safe(netmeta?.country));
  item("region", safe(netmeta?.region));
  item("city", safe(netmeta?.city));
  item("postal", safe(netmeta?.postalCode));
  item("timezone", safe(netmeta?.timezone));
  item("latitude", safe(netmeta?.latitude));
  item("longitude", safe(netmeta?.longitude));
  item("asn", safe(netmeta?.asn));
  item("asn org", safe(netmeta?.asOrganization));
  item("colo", safe(netmeta?.colo));
  item("http protocol", safe(netmeta?.httpProtocol));
  item("tls version", safe(netmeta?.tlsVersion));
  item("tcp rtt", safe(netmeta?.clientTcpRtt));
  item("quic rtt", safe(netmeta?.clientQuicRtt));
  push("");

  push("[ browser ]");
  item("user agent", navigator.userAgent);
  item("platform", safe(navigator.platform));
  item("vendor", safe(navigator.vendor));
  item("language", safe(navigator.language));
  item("languages", safe(navigator.languages));
  item("timezone", safe(Intl.DateTimeFormat().resolvedOptions().timeZone));
  item("online", yesNo(navigator.onLine));
  item("cookies", yesNo(navigator.cookieEnabled));
  item("do not track", safe(navigator.doNotTrack));
  item("threads", safe(navigator.hardwareConcurrency));
  item("memory", navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "n/a");
  item("touch points", safe(navigator.maxTouchPoints));
  item("webdriver", yesNo(navigator.webdriver));
  push("");

  push("[ display ]");
  item("viewport", `${window.innerWidth} x ${window.innerHeight}`);
  item("screen", `${screen.width} x ${screen.height}`);
  item("avail screen", `${screen.availWidth} x ${screen.availHeight}`);
  item("pixel ratio", safe(window.devicePixelRatio));
  item("color depth", safe(screen.colorDepth));
  item("orientation", safe(screen.orientation?.type));
  push("");

  push("[ network hints ]");
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  item("connection api", conn ? "available" : "unavailable");
  if (conn) {
    item("type", safe(conn.type));
    item("effective type", safe(conn.effectiveType));
    item("downlink", conn.downlink ? `${conn.downlink} Mb/s` : "n/a");
    item("rtt", conn.rtt ? `${conn.rtt} ms` : "n/a");
    item("save data", yesNo(conn.saveData));
  }
  push("");

  push("[ graphics ]");
  const webgl = getWebGLInfo();
  item("webgl", yesNo(webgl.supported));
  item("gpu vendor", safe(webgl.vendor));
  item("gpu renderer", safe(webgl.renderer));
  push("");

  statusEl.textContent = netmeta ? "ready+edge" : "ready";
}

boot().catch((err) => {
  push("");
  push("[ error ]");
  push(String(err?.message || err));
  statusEl.textContent = "error";
});
