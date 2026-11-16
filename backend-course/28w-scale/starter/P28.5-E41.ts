// P28.5-E41: ‏timed: למדוד פונקציות אסינכרוניות
// כתוב וייצא:
//   export function createTimer(now?: () => number): { timed<A extends unknown[], R>(name: string, fn: (...args: A) => Promise<R>): (...args: A) => Promise<R>; summary(): Record<string, { count: number; errors: number; p50: number; p99: number }> }
//
// בדיקה:  npm run check P28.5-E41
