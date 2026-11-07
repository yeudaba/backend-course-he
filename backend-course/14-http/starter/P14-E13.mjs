// P14-E13
// parseRequest("GET /a?x=1 HTTP/1.1\r\nHost: h\r\n\r\n")
//   → { method: "GET", path: "/a", query: { x: "1" }, headers: { host: "h" }, body: undefined }
export function parseRequest(raw) {
  // כתוב כאן
}
