// P29-E100: בדיקת מבנה לבקשה שיצאה
// כתוב וייצא:
//   type Body = { model: string; max_tokens: number; system?: string | { type: "text"; text: string }[]; tools?: { name: string; input_schema: { properties?: Record<string, unknown> } }[]; messages: unknown[] };
//   export function lintRequest(body: Body, rules: { models: string[]; maxTokens: number; untrustedTags?: string[] }): string[]
//
// בדיקה:  npm run check P29-E100
