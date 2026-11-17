// P29.5-E42: ‏POST /agent עם deadline
// כתוב וייצא:
//   type Run = (prompt: string, signal: AbortSignal) => Promise<{ status: "done"; text: string } | { status: "max_steps" }>;
//   export function agentApp(run: Run, opts: { timeoutMs: number }): express.Express
//
// בדיקה:  npm run check P29.5-E42
