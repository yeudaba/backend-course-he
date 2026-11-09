// P28.5-E07: histogram שאפשר לאחד בין שרתים
// דליים לוגריתמיים: הגבול העליון של דלי i הוא 1.1^i מילישניות
const GROWTH = 1.1;

export interface Histogram {
  counts: number[];
  total: number;
}

export const createHistogram = (): Histogram => ({ counts: [], total: 0 });

export function record(h: Histogram, ms: number): void {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function merge(...hs: Histogram[]): Histogram {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function histPercentile(h: Histogram, p: number): number {
  throw new Error("עוד לא כתבת את הפתרון");
}
