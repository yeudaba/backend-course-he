// P14-E13
export function parseRequest(raw) {
  const text = raw.replaceAll("\r\n", "\n");
  const split = text.indexOf("\n\n");
  const head = split === -1 ? text : text.slice(0, split);
  const rawBody = split === -1 ? "" : text.slice(split + 2);
  const [requestLine, ...headerLines] = head.split("\n");

  const parts = requestLine.split(" ");
  if (parts.length !== 3) throw new Error("שורת בקשה לא תקינה");
  const [method, target] = parts;
  const url = new URL(target, "http://x");

  const headers = {};
  for (const line of headerLines) {
    const i = line.indexOf(":");
    headers[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }

  let body;
  if (rawBody !== "") {
    body = headers["content-type"]?.includes("json") ? JSON.parse(rawBody) : rawBody;
  }
  return { method, path: url.pathname, query: Object.fromEntries(url.searchParams), headers, body };
}

const raw = "PATCH /orders/17?notify=false HTTP/1.1\r\nHost: api.shop.co.il\r\nContent-Type: application/json\r\n\r\n{\"status\":\"shipped\"}";
console.log(JSON.stringify(parseRequest(raw)));
