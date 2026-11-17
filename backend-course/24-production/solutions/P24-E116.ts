// P24-E116: histogram_quantile ביד
export function quantileFromBuckets(buckets: { le: number; count: number }[], q: number): number {
  if (!(q >= 0 && q <= 1)) throw new RangeError(`q לא תקין: ${q}`);
  const total = buckets.at(-1)?.count ?? 0;
  if (total === 0) return NaN;
  const rank = q * total;
  const i = buckets.findIndex((b) => b.count >= rank);
  const b = buckets[i];
  if (b.le === Infinity) return buckets[i - 1]?.le ?? NaN; // אין גבול עליון — הכי טוב שאפשר לומר
  const lower = i === 0 ? 0 : buckets[i - 1].le;
  const prevCount = i === 0 ? 0 : buckets[i - 1].count;
  if (b.count === prevCount) return lower;
  return lower + ((b.le - lower) * (rank - prevCount)) / (b.count - prevCount);
}

const buckets = [
  { le: 0.05, count: 600 }, { le: 0.1, count: 850 }, { le: 0.25, count: 930 },
  { le: 0.5, count: 960 }, { le: 1, count: 990 }, { le: Infinity, count: 1000 },
];
for (const q of [0.5, 0.95, 0.99, 0.999]) console.log(q, quantileFromBuckets(buckets, q).toFixed(4));
