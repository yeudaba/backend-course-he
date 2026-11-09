// P29.5-E25: חבילת evals לסוכן — כמה תרחישים, כמה ניסיונות לכל אחד, ודוח
import type Anthropic from "@anthropic-ai/sdk";
import { evaluateTrajectory, type Expectations, type Trajectory } from "./P29.5-E13.ts";

export interface Scenario {
  name: string;
  prompt: string;
  expect: Expectations;
}

export interface RunOutput extends Trajectory {
  costUsd: number;
}

export async function runEvalSuite({
  scenarios,
  makeClient,
  agent,
  trials = 3,
  concurrency = 4,
}: {
  scenarios: Scenario[];
  makeClient: (scenario: Scenario, trial: number) => Anthropic;
  agent: (client: Anthropic, prompt: string) => Promise<RunOutput>;
  trials?: number;
  concurrency?: number;
}) {
  const jobs = scenarios.flatMap((s) => Array.from({ length: trials }, (_, t) => ({ s, t })));
  const outcomes = new Map<string, { pass: boolean; failures: string[]; costUsd: number }[]>();
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const { s, t } = jobs[next++];
      let r: { pass: boolean; failures: string[]; costUsd: number };
      try {
        const out = await agent(makeClient(s, t), s.prompt);
        r = { ...evaluateTrajectory(out, s.expect), costUsd: out.costUsd };
      } catch (err) {
        r = { pass: false, failures: [`הריצה נכשלה: ${(err as Error).message}`], costUsd: 0 }; // קריסה היא כישלון — לא מדלגים
      }
      outcomes.set(s.name, [...(outcomes.get(s.name) ?? []), r]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));

  const results = scenarios.map((s) => {
    const rs = outcomes.get(s.name)!;
    const passes = rs.filter((r) => r.pass).length;
    return {
      name: s.name,
      trials: rs.length,
      passes,
      passRate: passes / rs.length,
      failures: [...new Set(rs.flatMap((r) => r.failures))],
      avgCostUsd: Math.round((rs.reduce((x, r) => x + r.costUsd, 0) / rs.length) * 1e6) / 1e6,
    };
  });
  const totalPasses = results.reduce((x, r) => x + r.passes, 0);
  return {
    results,
    passRate: totalPasses / jobs.length,
    flaky: results.filter((r) => r.passRate > 0 && r.passRate < 1).map((r) => r.name), // עובר לפעמים — הכי מסוכן
    failing: results.filter((r) => r.passRate === 0).map((r) => r.name),
  };
}
