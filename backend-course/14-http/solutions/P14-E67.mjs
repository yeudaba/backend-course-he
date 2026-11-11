// P14-E67: סיכום של לשונית Network
export function networkSummary(entries) {
  let best = null;
  const byHost = {};
  for (const e of entries) {
    if (!best || e.ms > best.ms) best = e;
    const host = new URL(e.url).host;
    byHost[host] = (byHost[host] ?? 0) + 1;
  }
  return {
    count: entries.length,
    bytes: entries.reduce((sum, e) => sum + e.size, 0),
    failed: entries.filter((e) => e.status === 0 || e.status >= 400).length,
    json: entries.filter((e) => (e.contentType ?? "").toLowerCase().includes("json")).length,
    slowest: best ? best.url : null,
    byHost,
  };
}

console.log(
  networkSummary([
    { url: "https://news.test/", method: "GET", status: 200, contentType: "text/html", size: 51200, ms: 120 },
    { url: "https://news.test/api/articles?page=1", method: "GET", status: 200, contentType: "application/json; charset=utf-8", size: 8300, ms: 340 },
    { url: "https://cdn.test/app.js", method: "GET", status: 200, contentType: "text/javascript", size: 210000, ms: 90 },
    { url: "https://ads.test/pixel", method: "GET", status: 0, size: 0, ms: 3000 },
    { url: "https://news.test/api/me", method: "GET", status: 401, contentType: "application/problem+json", size: 120, ms: 30 },
  ]),
);
console.log(networkSummary([]));
