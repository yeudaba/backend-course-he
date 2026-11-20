// P30-E114: מה נכנס למטלה, ומה ל־"What I'd add"
type Task = { id: string; hours: number; priority: "must" | "should" | "nice" };

export function takeHomePlan(tasks: Task[], budgetHours: number) {
  if (!(budgetHours >= 0)) throw new RangeError("תקציב לא תקין");
  if (tasks.some((t) => !(t.hours >= 0))) throw new RangeError("שעות לא תקינות");
  const min = (h: number) => Math.round(h * 60);
  const budget = min(budgetHours);
  const chosen = new Set<string>();
  let used = 0;
  for (const t of tasks.filter((t) => t.priority === "must")) {
    chosen.add(t.id);
    used += min(t.hours);
  }
  const overBudget = used > budget;
  for (const level of ["should", "nice"] as const) {
    for (const t of tasks.filter((t) => t.priority === level)) {
      if (used + min(t.hours) < budget) {
        chosen.add(t.id);
        used += min(t.hours);
      }
    }
  }
  return {
    plan: tasks.filter((t) => chosen.has(t.id)).map((t) => t.id),
    wontDo: tasks.filter((t) => !chosen.has(t.id)).map((t) => t.id),
    hours: used / 60,
    overBudget,
  };
}
