// P26-E76: לוח זמנים של backoff
type Kind = "fixed" | "exponential";

export function backoffDelays(attempts: number, delay: number, type: Kind): number[] {
  if (!Number.isInteger(attempts) || attempts < 1) throw new RangeError("attempts חייב להיות שלם חיובי");
  if (!(delay >= 0)) throw new RangeError("delay לא יכול להיות שלילי");
  return Array.from({ length: attempts - 1 }, (_, i) => (type === "fixed" ? delay : delay * 2 ** i));
}

export function giveUpAfter(attempts: number, delay: number, type: Kind): number {
  return backoffDelays(attempts, delay, type).reduce((s, x) => s + x, 0);
}
