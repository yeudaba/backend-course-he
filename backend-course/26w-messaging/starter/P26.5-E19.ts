// P26.5-E19: consumer lag — כמה ה־consumers מאחור, והאם הפער גדל
export interface LagReport {
  perPartition: Record<number, number>;
  total: number;
  worstPartition: number | null;
}

export function consumerLag(end: Record<number, number>, committed: Record<number, number>, earliest: Record<number, number> = {}): LagReport {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function isFallingBehind(samples: number[], { window = 3 } = {}): boolean {
  throw new Error("עוד לא כתבת את הפתרון");
}
