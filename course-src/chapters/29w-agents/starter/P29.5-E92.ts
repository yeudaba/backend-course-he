// P29.5-E92: למצוא בעיות ב־trace בקוד
// כתוב וייצא:
//   type Step = { step: number; stopReason: string; cacheRead: number; tools: { name: string; input: unknown; ms: number; isError: boolean }[] };
//   export function findTraceIssues(steps: Step[], opts: { slowMs: number; repeat: number }): string[]
//
// בדיקה:  npm run check P29.5-E92
