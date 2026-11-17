import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createAgentMetrics } = await load(import.meta.url, "P29.5-E85.ts");

test("הפורמט המדויק מהמשימה", () => {
  const m = createAgentMetrics([2, 5]);
  m.recordRun({ outcome: "max_steps", steps: 12, costUsd: 0.05 });
  m.recordRun({ outcome: "done", steps: 2, costUsd: 0.0234 });
  m.recordRun({ outcome: "done", steps: 4, costUsd: 0.03 });
  m.recordRun({ outcome: "done", steps: 5, costUsd: 0.02 });
  assert.equal(
    m.render(),
    `# TYPE agent_runs_total counter
agent_runs_total{outcome="done"} 3
agent_runs_total{outcome="max_steps"} 1
# TYPE agent_steps histogram
agent_steps_bucket{le="2"} 1
agent_steps_bucket{le="5"} 3
agent_steps_bucket{le="+Inf"} 4
agent_steps_sum 23
agent_steps_count 4
# TYPE agent_cost_usd_total counter
agent_cost_usd_total 0.1234
`,
  );
});
test("ריק, ועיגול", () => {
  const m = createAgentMetrics([3]);
  assert.equal(m.render(), '# TYPE agent_runs_total counter\n# TYPE agent_steps histogram\nagent_steps_bucket{le="3"} 0\nagent_steps_bucket{le="+Inf"} 0\nagent_steps_sum 0\nagent_steps_count 0\n# TYPE agent_cost_usd_total counter\nagent_cost_usd_total 0\n');
  for (let i = 0; i < 3; i++) m.recordRun({ outcome: "refused", steps: 1, costUsd: 0.1 });
  assert.match(m.render(), /agent_cost_usd_total 0\.3\n$/);
});
test("outcome לא חוקי", () => {
  const m = createAgentMetrics([1]);
  for (const outcome of ['done"} 1\nfake', "Done", "max-steps", ""]) assert.throws(() => m.recordRun({ outcome, steps: 1, costUsd: 0 }), Error, outcome);
  assert.doesNotMatch(m.render(), /fake/);
});
