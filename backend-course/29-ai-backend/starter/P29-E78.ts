// P29-E78: האם ה־prompt cache עובד?
// כתוב וייצא:
//   type Usage = { input_tokens: number; output_tokens: number; cache_creation_input_tokens?: number | null; cache_read_input_tokens?: number | null };
//   export function cacheReport(usages: Usage[]): { calls: number; writes: number; reads: number; cachedShare: number; verdict: "no_cache" | "warming_up" | "never_read" | "working" }
//
// בדיקה:  npm run check P29-E78
