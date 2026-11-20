// P28-E35: תקציב latency של בקשה
type Step = { name: string; ms: number; count?: number };

export function latencyBudget(steps: Step[]) {
  const costs = steps.map((s) => s.ms * (s.count ?? 1));
  const total = costs.reduce((a, b) => a + b, 0);
  if (total === 0) return { totalMs: 0, slowest: null, slowestShare: 0 };
  let best = 0;
  for (let i = 1; i < costs.length; i++) if (costs[i] >= costs[best]) best = i;
  return {
    totalMs: Math.round(total * 100) / 100,
    slowest: steps[best].name,
    slowestShare: Math.round((costs[best] / total) * 100),
  };
}
