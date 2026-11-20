// P29.5-E94: pass@k ו־pass^k
function check(n: number, c: number, k: number) {
  if (![n, c, k].every(Number.isInteger) || c < 0 || c > n || k < 1 || k > n) throw new RangeError(`n=${n}, c=${c}, k=${k} לא תקינים`);
}

// C(a, k) / C(n, k)
function ratio(a: number, n: number, k: number): number {
  if (a <= k) return 0;
  let r = 1;
  for (let i = 0; i < k; i++) r *= (a - i) / (n - i);
  return r;
}

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;

export function passAtK(n: number, c: number, k: number): number {
  check(n, c, k);
  return r4(1 - ratio(n - c, n, k));
}

export function passHatK(n: number, c: number, k: number): number {
  check(n, c, k);
  return r4(ratio(c, n, k));
}
