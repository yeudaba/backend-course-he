// P29.5-E85: מדדים לסוכן ב־/metrics
export function createAgentMetrics(buckets: number[]) {
  const outcomes = new Map<string, number>();
  const bucketCounts = buckets.map(() => 0);
  let count = 0;
  let stepsSum = 0;
  let cost = 0;
  return {
    recordRun(r: { outcome: string; steps: number; costUsd: number }) {
      if (!/^[a-z_]+$/.test(r.outcome)) throw new Error(`outcome לא חוקי: ${r.outcome}`);
      outcomes.set(r.outcome, (outcomes.get(r.outcome) ?? 0) + 1);
      buckets.forEach((le, i) => {
        if (r.steps <= le) bucketCounts[i]++;
      });
      count++;
      stepsSum += r.steps;
      cost += r.costUsd;
    },
    render() {
      const lines = ["# TYPE agent_runs_total counter"];
      for (const o of [...outcomes.keys()].sort()) lines.push(`agent_runs_total{outcome="${o}"} ${outcomes.get(o)}`);
      lines.push("# TYPE agent_steps histogram");
      buckets.forEach((le, i) => lines.push(`agent_steps_bucket{le="${le}"} ${bucketCounts[i]}`));
      lines.push(`agent_steps_bucket{le="+Inf"} ${count}`, `agent_steps_sum ${stepsSum}`, `agent_steps_count ${count}`);
      lines.push("# TYPE agent_cost_usd_total counter", `agent_cost_usd_total ${Math.round(cost * 1e6) / 1e6}`);
      return lines.join("\n") + "\n";
    },
  };
}
