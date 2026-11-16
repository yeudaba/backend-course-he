// P29.5-E84: עובדים במקביל, עם מגבלה ו־timeout
// כתוב וייצא:
//   type Task = { worker: string; run: (signal: AbortSignal) => Promise<string> };
//   export function delegateAll(tasks: Task[], opts: { concurrency: number; timeoutMs: number }): Promise<{ worker: string; ok: boolean; text: string }[]>
//
// בדיקה:  npm run check P29.5-E84
