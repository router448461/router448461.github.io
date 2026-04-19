exports.handler = async (event) => {
  const h = event.headers || {};

  const firstIp = (value) => {
    if (!value) return null;
    return String(value).split(",")[0].trim();
  };

  const ip =
    firstIp(h["cf-connecting-ip"]) ||
    firstIp(h["x-nf-client-connection-ip"]) ||
    firstIp(h["x-forwarded-for"]) ||
    null;

  const ipv = ip
    ? ip.includes(":")
      ? "ipv6"
      : "ipv4"
    : "unknown";

  const body = {
    ok: true,
    timestamp: new Date().toISOString(),
    ip,
    ipv,
    method: event.httpMethod || "GET",
    host: h.host || null,
    protocol: h["x-forwarded-proto"] || "https",
    userAgent: h["user-agent"] || null,
    referer: h.referer || h.referrer || null,

    country: h["cf-ipcountry"] || h["x-country"] || null,
    region: h["x-region"] || null,
    city: h["x-city"] || null,
    colo: h["cf-ray"] ? String(h["cf-ray"]).split("-")[1] || null : null,

    asn: h["x-asn"] || null,
    asnOrg: h["x-as-name"] || null,

    headers: {
      "cf-connecting-ip": h["cf-connecting-ip"] || null,
      "x-forwarded-for": h["x-forwarded-for"] || null,
      "x-forwarded-proto": h["x-forwarded-proto"] || null,
      "cf-ipcountry": h["cf-ipcountry"] || null,
      "cf-ray": h["cf-ray"] || null,
      "x-nf-client-connection-ip": h["x-nf-client-connection-ip"] || null
    }
  };

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate"
    },
    body: JSON.stringify(body, null, 2)
  };
};
