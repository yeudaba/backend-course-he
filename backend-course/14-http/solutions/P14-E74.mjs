// P14-E74: ממה שנכשל ב־Network — לפקודות curl
export function failedAsCurl(entries) {
  const failed = entries.filter((e) => e.status === 0 || e.status >= 400).sort((a, b) => a.startedAt - b.startedAt);
  const seen = new Set();
  const out = [];
  for (const e of failed) {
    const key = `${e.method} ${e.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const parts = ["curl"];
    if (e.method !== "GET") parts.push("-X", e.method);
    parts.push(`'${e.url}'`);
    for (const [name, value] of Object.entries(e.headers ?? {})) {
      if (name.toLowerCase() !== "cookie") parts.push("-H", `'${name}: ${value}'`);
    }
    out.push(parts.join(" "));
  }
  return out;
}

const entries = [
  { method: "GET", url: "http://shop.test/api/me", status: 401, startedAt: 30, headers: { Accept: "application/json" } },
  { method: "POST", url: "http://shop.test/api/orders", status: 500, startedAt: 10, headers: { "Content-Type": "application/json", Cookie: "sid=8f3a" } },
  { method: "GET", url: "http://shop.test/", status: 200, startedAt: 1 },
  { method: "GET", url: "http://shop.test/api/me", status: 401, startedAt: 20 },
  { method: "GET", url: "http://ads.test/pixel", status: 0, startedAt: 5 },
];
for (const line of failedAsCurl(entries)) console.log(line);
