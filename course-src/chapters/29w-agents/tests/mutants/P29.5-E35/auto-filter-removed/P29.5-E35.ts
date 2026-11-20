// P29.5-E35: קריאה אחת, workflow או סוכן — בקוד
type Task = { steps: "one" | "fixed" | "open"; worthCost: boolean; modelGood: boolean; recoverable: boolean };
type Approach = "single_call" | "workflow" | "agent";

export function chooseApproach(task: Task): { approach: Approach; reasons: string[] } {
  if (task.steps === "one") return { approach: "single_call", reasons: [] };
  if (task.steps === "fixed") return { approach: "workflow", reasons: ["steps_known"] };
  const checks: [boolean, string][] = [
    [task.worthCost, "not_worth_cost"],
    [task.modelGood, "model_not_good"],
    [task.recoverable, "not_recoverable"],
  ];
  const reasons = checks.map(([, reason]) => reason);
  return { approach: reasons.length === 0 ? "agent" : "workflow", reasons };
}
