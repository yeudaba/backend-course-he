// P14-E10
// toCurl({ method: "POST", url: "http://x/p", body: { a: 1 } })
//   → curl -X POST 'http://x/p' -H 'Content-Type: application/json' -d '{"a":1}'
export function toCurl({ method = "GET", url, headers = {}, body }) {
  // כתוב כאן
}
