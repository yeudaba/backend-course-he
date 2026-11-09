// P28.5-E07: histogram שאפשר לאחד בין שרתים
// דליים לוגריתמיים: הגבול העליון של דלי i הוא 1.1^i מילישניות — שגיאה של עד 10%, בכל טווח
const GROWTH = 1.1;

export interface Histogram {
  counts: number[];
  total: number;
}

export const createHistogram = (): Histogram => ({ counts: [], total: 0 });

export const bucketOf = (ms: number): number => (ms <= 1 ? 0 : Math.ceil(Math.log(ms) / Math.log(GROWTH) - 1e-9));
export const upperBound = (i: number): number => GROWTH ** i;

export function record(h: Histogram, ms: number): void {
  if (!(ms >= 0)) throw new Error(`זמן לא תקין: ${ms}`);
  const i = bucketOf(ms);
  h.counts[i] = (h.counts[i] ?? 0) + 1;
  h.total++;
}

export function merge(...hs: Histogram[]): Histogram {
  const out = createHistogram();
  for (const h of hs) {
    h.counts.forEach((c, i) => {
      if (c) out.counts[i] = (out.counts[i] ?? 0) + c;
    });
    out.total += h.total;
  }
  return out;
}

export function histPercentile(h: Histogram, p: number): number {
  if (h.total === 0) throw new Error("histogram ריק");
  const rank = Math.ceil((p / 100) * h.total);
  let seen = 0;
  for (let i = 0; i < h.counts.length; i++) {
    seen += h.counts[i] ?? 0;
    if (seen >= rank) return Math.round(upperBound(i) * 100) / 100;
  }
  throw new Error("לא אמור לקרות");
}
