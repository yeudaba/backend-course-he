// P25-E24
import { load as parseYaml } from "js-yaml";

export interface Finding {
  job: string | null;
  rule: "yaml" | "permissions" | "timeout" | "unpinned-action" | "npm-install" | "secret-in-run" | "unknown-needs" | "deploy-without-needs" | "pr-secrets";
}

interface Step { uses?: string; run?: string; env?: Record<string, string> }
interface Job { needs?: string | string[]; "timeout-minutes"?: number; steps?: Step[]; env?: Record<string, string>; if?: string }

export function lintWorkflow(text: string): Finding[] {
  let wf: { on?: unknown; permissions?: unknown; jobs?: Record<string, Job>; env?: Record<string, string> } & Record<string, unknown>;
  try {
    wf = parseYaml(text) as typeof wf;
  } catch {
    return [{ job: null, rule: "yaml" }];
  }
  const out: Finding[] = [];
  const add = (job: string | null, rule: Finding["rule"]) => out.push({ job, rule });
  if (wf.permissions === undefined) add(null, "permissions");
  const on = wf.on ?? wf["true"];
  const onPr = Array.isArray(on) ? on.includes("pull_request") : typeof on === "object" && on !== null ? "pull_request" in on : on === "pull_request";
  const jobs = wf.jobs ?? {};
  for (const [name, job] of Object.entries(jobs)) {
    if (job["timeout-minutes"] === undefined) add(name, "timeout");
    const steps = job.steps ?? [];
    if (steps.some((s) => s.uses && (!s.uses.includes("@") || /@(main|master)$/.test(s.uses)))) add(name, "unpinned-action");
    if (steps.some((s) => /\bnpm (install|i)\b/.test(s.run ?? ""))) add(name, "npm-install");
    // ${{ secrets.X }} בתוך הסקריפט עצמו: הערך נכנס לטקסט של הסקריפט (וגם injection). דרך env — כמשתנה
    if (steps.some((s) => /\$\{\{\s*secrets\./.test(s.run ?? ""))) add(name, "secret-in-run");
    const needs = [job.needs ?? []].flat();
    if (needs.some((n) => !(n in jobs))) add(name, "unknown-needs");
    if (/deploy/i.test(name) && needs.length === 0) add(name, "deploy-without-needs");
    // job שרץ גם על pull request ומשתמש בסודות, בלי if שמגביל ל־push
    const usesSecrets = /secrets\./.test(JSON.stringify(job));
    if (onPr && usesSecrets && !/push|refs\/heads/.test(job.if ?? "")) add(name, "pr-secrets");
  }
  return out;
}
