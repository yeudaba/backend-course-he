// P29-E77: לסווג שגיאה של ה־API
// כתוב וייצא:
//   type Kind = "rate_limited" | "overloaded" | "timeout" | "network" | "bad_request" | "config" | "bug";
//   export function classifyApiError(err: unknown): { kind: Kind; status: number | null; retryLater: boolean; userMessage: string }
//
// בדיקה:  npm run check P29-E77
