// P26.3-E34: AZ, region ופיזור עותקים
export function regionOf(az: string): string | null {
  const m = /^([a-z]{2}(?:-[a-z]+)+-\d+)[a-z]$/.exec(az);
  return m ? m[1] : null;
}

export function spreadAcrossAzs(replicas: number, azs: string[]): Record<string, number> {
  if (azs.length === 0) throw new RangeError("צריך לפחות AZ אחד");
  const out: Record<string, number> = Object.fromEntries(azs.map((az) => [az, 0]));
  for (let i = 0; i < replicas; i++) out[azs[i % azs.length]]++;
  return out;
}

export function survivesAzLoss(spread: Record<string, number>, minHealthy: number): boolean {
  const total = Object.values(spread).reduce((s, n) => s + n, 0);
  return Object.values(spread).every((n) => total - n >= minHealthy);
}
