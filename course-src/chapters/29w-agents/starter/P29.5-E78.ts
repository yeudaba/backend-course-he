// P29.5-E78: מאיפה ממשיכים
// כתוב וייצא:
//   type State = { messages: { role: "user" | "assistant"; content: unknown }[]; results: Record<string, string> };
//   type Next = { next: "call_model" } | { next: "run_tools"; pending: string[] } | { next: "send_results" } | { next: "done" };
//   export function resumePoint(state: State): Next
//
// בדיקה:  npm run check P29.5-E78
