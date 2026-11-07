// P14-E14
export const STATUS_TEXT = {
  200: "OK", 201: "Created", 204: "No Content", 400: "Bad Request", 401: "Unauthorized",
  403: "Forbidden", 404: "Not Found", 409: "Conflict", 500: "Internal Server Error",
};

// buildResponse(200, { a: 1 }) →
//   "HTTP/1.1 200 OK\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 7\r\n\r\n{\"a\":1}"
export function buildResponse(status, body, headers = {}) {
  // כתוב כאן
}
