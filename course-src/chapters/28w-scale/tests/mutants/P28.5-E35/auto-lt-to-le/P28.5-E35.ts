// P28.5-E35: הסיכוי שהדף איטי
function check(slowRate: number) {
  if (!(slowRate > 0 && slowRate <= 1)) throw new RangeError("slowRate בין 0 ל־1");
}
const chance = (rate: number, n: number) => 1 - (1 - rate) ** n;

export function slowPageChance(slowRate: number, calls: number): number {
  check(slowRate);
  return Math.round(chance(slowRate, calls) * 10_000) / 10_000;
}

export function maxCalls(slowRate: number, maxChance: number): number {
  check(slowRate);
  let n = 0;
  while (chance(slowRate, n + 1) <= maxChance) n++;
  return n;
}
