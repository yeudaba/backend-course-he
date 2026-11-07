// P14-E14
export const STATUS_TEXT = {
  200: "OK", 201: "Created", 204: "No Content", 400: "Bad Request", 401: "Unauthorized",
  403: "Forbidden", 404: "Not Found", 409: "Conflict", 500: "Internal Server Error",
};

export function buildResponse(status, body, headers = {}) {
  const text = STATUS_TEXT[status];
  if (!text) throw new Error(`status לא מוכר: ${status}`);
  if (status === 204 && body !== undefined) throw new Error("204 לא יכול להכיל גוף");

  const all = { ...headers };
  let payload = "";
  if (body !== undefined) {
    payload = typeof body === "string" ? body : JSON.stringify(body);
    const hasType = Object.keys(headers).some((h) => h.toLowerCase() === "content-type");
    if (typeof body !== "string" && !hasType) all["Content-Type"] = "application/json; charset=utf-8";
    all["Content-Length"] = Buffer.byteLength(payload);
  }
  const lines = [`HTTP/1.1 ${status} ${text}`, ...Object.entries(all).map(([k, v]) => `${k}: ${v}`)];
  return lines.join("\r\n") + "\r\n\r\n" + payload;
}

console.log(buildResponse(201, { id: 3, name: "מסך" }, { Location: "/products/3" }));
