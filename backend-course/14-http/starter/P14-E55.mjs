// P14-E55: משגיאה לתשובה
// כתוב וייצא (export class ... / export function ...):
//   NotFoundError, ConflictError, ValidationError(message, details) — כולן extends Error
//   toApiError(err) → { status, body: { error: { code, message, details? } } }
//   400 VALIDATION · 404 NOT_FOUND · 409 CONFLICT · SyntaxError → 400 INVALID_JSON · אחר → 500 INTERNAL
//
// הרצה:   node 14-http/starter/P14-E55.mjs
// בדיקה:  npm run check P14-E55
