// P28.5-E34: כמה נשאר מה־error budget?
const r1 = (x: number) => Math.round(x * 10) / 10;

export function errorBudget(slo: number, windowDays: number, badMinutes: number) {
  if (!(slo > 0 && slo < 1)) throw new RangeError("slo בין 0 ל־1");
  if (!(windowDays > 0)) throw new RangeError("windowDays חיובי");
  if (!(badMinutes >= 0)) throw new RangeError("badMinutes לא שלילי");
  const budget = (1 - slo) * windowDays * 1440;
  return {
    budgetMinutes: r1(budget),
    usedPct: r1((badMinutes / budget) * 100),
    remainingMinutes: r1(Math.max(0, budget - badMinutes)),
  };
}
