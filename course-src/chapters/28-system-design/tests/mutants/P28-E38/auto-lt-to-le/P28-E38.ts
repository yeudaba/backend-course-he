// P28-E38: אחסון שגדל כל חודש
export function monthlyStorage(writesPerDay: number, bytesPerWrite: number, monthlyGrowth: number, months: number): number[] {
  const out: number[] = [];
  let rate = writesPerDay;
  let total = 0;
  for (let m = 0; m <= months; m++) {
    total += rate * 30 * bytesPerWrite;
    out.push(Math.round((total / 1e9) * 100) / 100);
    rate *= 1 + monthlyGrowth;
  }
  return out;
}
