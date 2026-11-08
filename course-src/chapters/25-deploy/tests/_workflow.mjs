// עוזר לבדיקות של workflows: קורא YAML מקובץ ההתחלה/הפתרון
import fs from "node:fs";
import assert from "node:assert/strict";
import { load as parseYaml } from "js-yaml";
import { target } from "../../tools/load.mjs";

export function readWorkflow(testUrl, file) {
  const text = fs.readFileSync(target(testUrl, file), "utf8");
  let wf;
  try {
    wf = parseYaml(text);
  } catch (err) {
    assert.fail(`YAML לא תקין: ${err.message.split("\n")[0]}`);
  }
  assert.ok(wf && typeof wf === "object" && wf.jobs, "אין בקובץ jobs — עדיין לא כתבת workflow?");
  return { wf, text, on: wf.on ?? wf[true] };
}
export const steps = (job) => (job.steps ?? []).map((s) => ({ ...s, text: `${s.uses ?? ""} ${s.run ?? ""}`.trim() }));
export const stepIndex = (job, re) => steps(job).findIndex((s) => re.test(s.text));
