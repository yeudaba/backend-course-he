// P28.5-E18: HyperLogLog — כמה ערכים שונים, ב־4KB זיכרון
import { createHash } from "node:crypto";

export interface HLL {
  p: number;
  registers: Uint8Array;
}

export const createHLL = (p = 12): HLL => ({ p, registers: new Uint8Array(1 << p) });

export const hash32 = (value: string | number): number => createHash("sha1").update(String(value)).digest().readUInt32BE(0);

export function add(h: HLL, value: string | number): void {
  const x = hash32(value);
  const idx = x >>> (32 - h.p); // p הביטים העליונים ← איזה רגיסטר
  const w = (x << h.p) >>> 0; // השאר
  const rho = w === 0 ? 32 - h.p + 1 : Math.clz32(w) + 1; // מיקום ה־1 הראשון
  if (rho > h.registers[idx]) h.registers[idx] = rho;
}

export function count(h: HLL): number {
  const m = h.registers.length;
  let sum = 0;
  let zeros = 0;
  for (const r of h.registers) {
    sum += 2 ** -r;
    if (r === 0) zeros++;
  }
  const alpha = 0.7213 / (1 + 1.079 / m);
  const e = (alpha * m * m) / sum;
  if (e <= 2.5 * m && zeros > 0) return Math.round(m * Math.log(m / zeros)); // מעט ערכים: linear counting
  return Math.round(e);
}

export function mergeHLL(a: HLL, b: HLL): HLL {
  if (a.p !== b.p) throw new Error("p שונה");
  const out = createHLL(a.p);
  for (let i = 0; i < out.registers.length; i++) out.registers[i] = Math.max(a.registers[i], b.registers[i]);
  return out;
}
