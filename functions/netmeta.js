async function fetchDns(name, type) {
  const url = new URL("https://dns.google/resolve");
  url.searchParams.set("name", name);
  url.searchParams.set("type", type);
  url.searchParams.set("cd", "0");
  url.searchParams.set("do", "1");
  url.searchParams.set("edns_client_subnet", "0.0.0.0/0");

  const res = await fetch(url.toString(), {
    headers: {
      accept: "application/dns-json"
    }
  });

  if (!res.ok) {
    return {
      status: null,
      ad: null,
      answer: []
    };
  }

  const json = await res.json();

  return {
    status: json.Status ?? null,
    ad: json.AD ?? null,
    answer: Array.isArray(json.Answer)
      ? [...new Set(json.Answer.map((entry) => String(entry.data).replace(/\.$/, "")))]
      : []
  };
}

function isIpv4(ip) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(String(ip || ""));
}

function isIpv6(ip) {
  return String(ip || "").includes(":");
}

function ipv4ToPtr(ip) {
  return String(ip)
    .split(".")
    .reverse()
    .join(".") + ".in-addr.arpa";
}

function expandIpv6(ip) {
  const raw = String(ip || "").toLowerCase();

  if (!raw.includes("::")) {
    return raw
      .split(":")
      .map((part) => part.padStart(4, "0"))
      .join(":");
  }

  const [leftRaw, rightRaw] = raw.split("::");
  const left = leftRaw ? leftRaw.split(":") : [];
  const right = rightRaw ? rightRaw.split(":") : [];
  const missing = 8 - (left.length + right.length);
  const middle = new Array(Math.max(missing, 0)).fill("0000");

  return [
    ...left.map((part) => part.padStart(4, "0")),
    ...middle,
    ...right.map((part) => part.padStart(4, "0"))
  ].join(":");
}

function ipv6ToPtr(ip) {
  return expandIpv6(ip)
    .replace(/:/g, "")
    .split("")
    .reverse()
    .join(".") + ".ip6.arpa";
}

async function resolveReversePtr(ip) {
  if (!ip) return [];

  try {
    const ptrName = isIpv4(ip)
      ? ipv4ToPtr(ip)
      : isIpv6(ip)
        ? ipv6ToPtr(ip)
        : null;

    if (!ptrName) return [];

    const ptr = await fetchDns(ptrName, "PTR");
    return ptr.answer || [];
  } catch {
    return [];
  }
}

export async function onRequest(context) {
  const request = context.request;
  const cf = request.cf || {};
  const url = new URL(request.url);
  const hostname = url.hostname;

  const xff = request.headers.get("x-forwarded-for");
  const sourceIp =
    request.headers.get("cf-connecting-ip") ||
    (xff ? xff.split(",")[0].trim() : null);

  const sourceIpv4 = isIpv4(sourceIp) ? sourceIp : null;
  const sourceIpv6 = isIpv6(sourceIp) ? sourceIp : null;

  const [
    siteA,
    siteAAAA,
    siteCNAME,
    siteNS,
    siteMX,
    siteTXT,
    sourcePtr
  ] = await Promise.all([
    fetchDns(hostname, "A").catch(() => ({ answer: [], status: null, ad: null })),
    fetchDns(hostname, "AAAA").catch(() => ({ answer: [], status: null, ad: null })),
    fetchDns(hostname, "CNAME").catch(() => ({ answer: [], status: null, ad: null })),
    fetchDns(hostname, "NS").catch(() => ({ answer: [], status: null, ad: null })),
    fetchDns(hostname, "MX").catch(() => ({ answer: [], status: null, ad: null })),
    fetchDns(hostname, "TXT").catch(() => ({ answer: [], status: null, ad: null })),
    resolveReversePtr(sourceIp)
  ]);

  const body = {
    sourceIp,
    sourceIpv4,
    sourceIpv6,
    rayId: request.headers.get("cf-ray") || null,
    requestMethod: request.method || null,
    scheme: url.protocol.replace(":", "").toLowerCase(),
    host: request.headers.get("host") || url.host,
    country: cf.country ?? null,
    region: cf.region ?? null,
    regionCode: cf.regionCode ?? null,
    city: cf.city ?? null,
    postalCode: cf.postalCode ?? null,
    latitude: cf.latitude ?? null,
    longitude: cf.longitude ?? null,
    timezone: cf.timezone ?? null,
    continent: cf.continent ?? null,
    asn: cf.asn ?? null,
    asOrganization: cf.asOrganization ?? null,
    colo: cf.colo ?? null,
    httpProtocol: cf.httpProtocol ?? null,
    tlsVersion: cf.tlsVersion ?? null,
    clientTcpRtt: cf.clientTcpRtt ?? null,
    clientQuicRtt: cf.clientQuicRtt ?? null,
    dns: {
      hostname,
      sourcePtr,
      siteA: siteA.answer,
      siteAAAA: siteAAAA.answer,
      siteCNAME: siteCNAME.answer,
      siteNS: siteNS.answer,
      siteMX: siteMX.answer,
      siteTXT: siteTXT.answer,
      status: siteA.status,
      ad: siteA.ad
    }
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
