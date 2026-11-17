// P29.5-E99: מגמה של evals במסד
// כתוב וייצא:
//   type Db = { query(text: string, params?: unknown[]): Promise<{ rows: any[] }> };
//   type Result = { scenario: string; trials: number; passes: number };
//   export function saveEvalRun(db: Db, run: { gitSha: string; results: Result[] }): Promise<number>
//   export function passRateTrend(db: Db, scenario: string, lastN: number): Promise<{ runId: number; gitSha: string; passRate: number }[]>
//
// בדיקה:  npm run check P29.5-E99
