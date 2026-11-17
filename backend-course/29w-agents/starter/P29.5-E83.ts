// P29.5-E83: מצב של ריצות ב־Redis
// כתוב וייצא:
//   type Status = "running" | "waiting" | "done";
//   export function createRunStore(redis: Redis, opts: { ttlSeconds: number }): {
//     save(runId: string, state: unknown, status: Status): Promise<void>;
//     load(runId: string): Promise<unknown | null>;
//     running(): Promise<string[]>;
//     remove(runId: string): Promise<void>;
//   }
//
// בדיקה:  npm run check P29.5-E83
