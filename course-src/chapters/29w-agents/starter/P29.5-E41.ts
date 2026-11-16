// P29.5-E41: לכל היותר שתי ריצות ללקוח, ב־Redis
// כתוב וייצא:
//   export function createRunSlots(redis: Redis, opts: { maxPerUser: number; ttlSeconds: number }): {
//     acquire(userId: string): Promise<boolean>;
//     release(userId: string): Promise<void>;
//     active(userId: string): Promise<number>;
//   }
//
// בדיקה:  npm run check P29.5-E41
