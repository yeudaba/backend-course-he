// P14-E06
const DEFAULT_PORTS = { "http:": 80, "https:": 443 };

export function parseUrl(text) {
  let url;
  try {
    url = new URL(text);
  } catch {
    throw new Error(`כתובת לא תקינה: ${text}`);
  }
  return {
    protocol: url.protocol.slice(0, -1),
    host: url.hostname,
    port: url.port ? Number(url.port) : (DEFAULT_PORTS[url.protocol] ?? null),
    path: url.pathname,
    query: Object.fromEntries(url.searchParams),
  };
}

console.log(JSON.stringify(parseUrl("http://localhost:4000/products?maxPrice=100&sort=price")));
console.log(JSON.stringify(parseUrl("https://shop.co.il")));
