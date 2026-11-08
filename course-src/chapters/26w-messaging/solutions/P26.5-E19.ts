// P26.5-E19: consumer lag — כמה ה־consumers מאחור, והאם הפער גדל
export interface LagReport {
  perPartition: Record<number, number>;
  total: number;
  worstPartition: number | null;
}

// end: ה־offset הבא שייכתב בכל partition (high watermark); committed: הבא שה־group יקרא (‎-1 = אין commit)
export function consumerLag(end: Record<number, number>, committed: Record<number, number>, earliest: Record<number, number> = {}): LagReport {
  const perPartition: Record<number, number> = {};
  let total = 0;
  let worstPartition: number | null = null;
  for (const [p, hw] of Object.entries(end)) {
    const part = Number(p);
    const c = committed[part];
    const from = c === undefined || c < 0 ? (earliest[part] ?? 0) : c; // בלי commit — כל מה שעוד שמור ב־topic
    const lag = Math.max(0, hw - from);
    perPartition[part] = lag;
    total += lag;
    if (worstPartition === null || lag > perPartition[worstPartition]) worstPartition = part;
  }
  return { perPartition, total, worstPartition };
}

// מתריעים כשה־lag עולה ברציפות — לא על קפיצה אחת
export function isFallingBehind(samples: number[], { window = 3 } = {}): boolean {
  if (samples.length < window + 1) return false;
  const last = samples.slice(-(window + 1));
  return last.every((v, i) => i === 0 || v > last[i - 1]);
}
