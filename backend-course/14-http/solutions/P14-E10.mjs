// P14-E10
const quote = (s) => `'${String(s).replaceAll("'", `'\\''`)}'`;

export function toCurl({ method = "GET", url, headers = {}, body }) {
  const parts = ["curl"];
  if (method !== "GET") parts.push("-X", method);
  parts.push(quote(url));
  const allHeaders = { ...headers };
  let data = body;
  if (body !== undefined && typeof body !== "string") {
    data = JSON.stringify(body);
    const hasType = Object.keys(headers).some((h) => h.toLowerCase() === "content-type");
    if (!hasType) allHeaders["Content-Type"] = "application/json";
  }
  for (const [name, value] of Object.entries(allHeaders)) parts.push("-H", quote(`${name}: ${value}`));
  if (data !== undefined) parts.push("-d", quote(data));
  return parts.join(" ");
}

console.log(toCurl({ url: "http://localhost:4000/products" }));
console.log(toCurl({ method: "POST", url: "http://localhost:4000/products", body: { name: "it's", price: 5 } }));
