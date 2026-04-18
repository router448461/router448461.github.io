export function onRequest(context) {
  const request = context.request;
  const cf = request.cf || {};

  const xff = request.headers.get("x-forwarded-for");
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    (xff ? xff.split(",")[0].trim() : null);

  const body = {
    ip,
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
    clientQuicRtt: cf.clientQuicRtt ?? null
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
