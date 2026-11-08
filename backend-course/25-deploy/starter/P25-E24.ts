// P25-E24: אתגר — linter קטן ל־workflows של GitHub Actions
import { load as parseYaml } from "js-yaml";

export interface Finding {
  job: string | null;
  rule: "yaml" | "permissions" | "timeout" | "unpinned-action" | "npm-install" | "secret-in-run" | "unknown-needs" | "deploy-without-needs" | "pr-secrets";
}

export function lintWorkflow(text: string): Finding[] {
  return []; // כתוב כאן
}
