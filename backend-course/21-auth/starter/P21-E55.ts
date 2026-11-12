// P21-E55: createApiClient
// כתוב וייצא class ApiError extends Error { status; code } ו־createApiClient(baseUrl, getToken) ← { request(method, path, body?) }
//   getToken() בכל בקשה ← Authorization: Bearer | body ← JSON + Content-Type | 2xx ← JSON, 204 ← null
//   אחרת ← ApiError(status, message ו־code מהגוף; לא JSON ← `HTTP ${status}`)
//
// הרצה:   node 21-auth/starter/P21-E55.ts
// בדיקה:  npm run check P21-E55
