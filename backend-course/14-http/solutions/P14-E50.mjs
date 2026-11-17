// P14-E50: לקרוא Content-Type
export function parseContentType(value) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const [type, ...params] = value.split(";");
  let charset = null;
  for (const param of params) {
    const i = param.indexOf("=");
    if (i === -1) continue;
    const name = param.slice(0, i).trim().toLowerCase();
    if (name === "charset") charset = param.slice(i + 1).trim().replace(/^"|"$/g, "").toLowerCase();
  }
  return { type: type.trim().toLowerCase(), charset };
}

export function isJson(value) {
  const parsed = parseContentType(value);
  if (!parsed) return false;
  return parsed.type === "application/json" || parsed.type.endsWith("+json");
}

for (const v of ["application/json; charset=utf-8", "Application/JSON", 'text/html;Charset="UTF-8"', "multipart/form-data; boundary=x1", "application/problem+json", undefined]) {
  console.log(String(v).padEnd(34), parseContentType(v), isJson(v));
}
