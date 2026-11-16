// P29.5-E33: מ־stop_reason לפעולה הבאה
// כתוב וייצא:
//   type Next =
//     | { action: "run_tools"; calls: { id: string; name: string; input: unknown }[] }
//     | { action: "done"; text: string }
//     | { action: "continue" }
//     | { action: "truncated" }
//     | { action: "refused"; category: string | null };
//   export function nextAction(msg: Anthropic.Message): Next
//
// בדיקה:  npm run check P29.5-E33
