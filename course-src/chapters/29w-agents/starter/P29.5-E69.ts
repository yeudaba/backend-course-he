// P29.5-E69: מצב ממתין ב־Redis, פעם אחת
// כתוב וייצא:
//   export function createApprovalStore(redis: Redis, opts: { ttlSeconds: number }): {
//     save(runId: string, state: unknown): Promise<void>;
//     peek(runId: string): Promise<unknown | null>;
//     take(runId: string): Promise<unknown | null>;
//   }
//
// בדיקה:  npm run check P29.5-E69
