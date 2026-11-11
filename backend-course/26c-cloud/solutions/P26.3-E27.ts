// P26.3-E27 — חשבון S3 לפי מדרגות
export type Tier = { upTo: number | null; price: number };

// מחירים לדוגמה (דולר). כל מדרגה: עד כמה יחידות (מצטבר), ומה המחיר ליחידה בה. null — "וכל השאר"
export const STORAGE_PER_GB: Tier[] = [
  { upTo: 51_200, price: 0.023 },
  { upTo: 512_000, price: 0.022 },
  { upTo: null, price: 0.021 },
];
export const TRANSFER_OUT_PER_GB: Tier[] = [
  { upTo: 100, price: 0 },
  { upTo: 10_240, price: 0.09 },
  { upTo: null, price: 0.085 },
];

export function tieredCost(amount: number, tiers: Tier[]): number {
  if (!(amount >= 0)) throw new RangeError("amount חייב להיות מספר לא שלילי");
  let cost = 0;
  let from = 0;
  for (const tier of tiers) {
    if (amount <= from) break;
    const to = tier.upTo === null ? amount : Math.min(amount, tier.upTo);
    cost += (to - from) * tier.price;
    from = to;
  }
  return cost;
}

const cents = (n: number) => Math.round(n * 100) / 100;

export function s3Bill(usage: { storageGb: number; putRequests: number; getRequests: number; transferOutGb: number }) {
  const storage = cents(tieredCost(usage.storageGb, STORAGE_PER_GB));
  const requests = cents((usage.putRequests / 1000) * 0.005 + (usage.getRequests / 1000) * 0.0004);
  const transfer = cents(tieredCost(usage.transferOutGb, TRANSFER_OUT_PER_GB));
  return { storage, requests, transfer, total: cents(storage + requests + transfer) };
}

console.log(tieredCost(60_000, STORAGE_PER_GB).toFixed(2));
console.log(tieredCost(80, TRANSFER_OUT_PER_GB), tieredCost(150, TRANSFER_OUT_PER_GB).toFixed(2));
const bill = s3Bill({ storageGb: 1_200, putRequests: 2_000_000, getRequests: 30_000_000, transferOutGb: 900 });
for (const [line, usd] of Object.entries(bill)) console.log(line.padEnd(10), `$${usd.toFixed(2).padStart(8)}`);
