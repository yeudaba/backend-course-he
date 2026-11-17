// P14-E66: מבקשות לקובץ .http
export function toHttpFile(requests) {
  const origins = new Set(requests.map((r) => new URL(r.url).origin));
  const base = requests.length >= 2 && origins.size === 1 ? [...origins][0] : null;
  const lines = [];
  if (base) lines.push(`@base = ${base}`, "");
  requests.forEach((r, i) => {
    if (i > 0) lines.push("");
    const url = base && r.url.startsWith(base) ? "{{base}}" + r.url.slice(base.length) : r.url;
    lines.push(`### ${r.name}`, `${r.method} ${url}`);
    for (const [name, value] of Object.entries(r.headers ?? {})) lines.push(`${name}: ${value}`);
    if (r.body !== undefined) {
      lines.push("", typeof r.body === "string" ? r.body : JSON.stringify(r.body, null, 2));
    }
  });
  return lines.join("\n") + "\n";
}

process.stdout.write(
  toHttpFile([
    { name: "כל המוצרים", method: "GET", url: "http://localhost:4000/products" },
    { name: "מוצר חדש", method: "POST", url: "http://localhost:4000/products", headers: { "Content-Type": "application/json" }, body: { name: "מסך" } },
  ]),
);
console.log("---");
process.stdout.write(toHttpFile([{ name: "בריאות", method: "GET", url: "https://api.shop.test/health" }]));
