// P26.3-E94: סימולציה של declarative pipeline
type Stage = { name: string; when?: boolean; fails?: boolean; unstable?: boolean };
type Result = "SUCCESS" | "UNSTABLE" | "FAILURE";

const ORDER = ["always", "failure", "success", "unstable", "unsuccessful", "cleanup"];

export function pipelineResult(stages: Stage[], post: string[]) {
  for (const p of post) if (!ORDER.includes(p)) throw new Error(`תנאי post לא מוכר: ${p}`);
  const ran: string[] = [];
  const skipped: string[] = [];
  let result: Result = "SUCCESS";
  for (const s of stages) {
    if (result === "FAILURE" || s.when === false) {
      skipped.push(s.name);
      continue;
    }
    ran.push(s.name);
    if (s.fails) result = "FAILURE";
    else if (s.unstable) result = "UNSTABLE";
  }
  const runs: Record<string, boolean> = {
    always: true,
    failure: result === "FAILURE",
    success: result === "SUCCESS",
    unstable: result === "UNSTABLE",
    unsuccessful: result !== "SUCCESS",
    cleanup: true,
  };
  return { ran, skipped, result, post: ORDER.filter((p) => post.includes(p) && runs[p]) };
}
