// P29.5-E93: טקסט התקדמות ללקוח
// כתוב וייצא:
//   type Ev =
//     | { type: "model"; step: number }
//     | { type: "tool_start"; name: string; input: unknown }
//     | { type: "tool_end"; name: string; isError: boolean }
//     | { type: "done" }
//     | { type: "error" };
//   export function progressText(ev: Ev, labels: Record<string, string>): string | null
//
// בדיקה:  npm run check P29.5-E93
