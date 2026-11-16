// P29-E66: שומר על הכלים: תקרה וחזרות
// כתוב וייצא:
//   export function createToolGuard(limits: { maxTotal: number; maxPerTool: number; maxRepeats: number }): (name: string, input: unknown) => { ok: true } | { ok: false; reason: "total" | "per_tool" | "repeat" }
//
// בדיקה:  npm run check P29-E66
