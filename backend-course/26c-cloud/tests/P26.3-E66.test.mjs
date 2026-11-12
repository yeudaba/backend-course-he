import { test } from "node:test";
import assert from "node:assert/strict";
import { readManifests, need, pinnedImage } from "./_k8s.mjs";

const { objs } = readManifests(import.meta.url, "P26.3-E66.yaml");

test("CronJob: לוח זמנים, אזור זמן ומדיניות", () => {
  const cj = need(objs, "CronJob", "nightly-report");
  assert.equal(cj.apiVersion, "batch/v1");
  assert.equal(cj.spec?.schedule, "0 2 * * *");
  assert.equal(cj.spec?.timeZone, "Asia/Jerusalem", "בלי timeZone — 02:00 UTC");
  assert.equal(cj.spec?.concurrencyPolicy, "Forbid");
  assert.equal(cj.spec?.successfulJobsHistoryLimit, 3);
  assert.equal(cj.spec?.failedJobsHistoryLimit, 1);
});
test("Job ו־Pod", () => {
  const job = need(objs, "CronJob", "nightly-report").spec?.jobTemplate?.spec;
  assert.ok(job, "spec.jobTemplate.spec");
  assert.equal(job.backoffLimit, 2);
  assert.equal(job.activeDeadlineSeconds, 1800);
  const pod = job.template?.spec;
  assert.ok(pod, "spec.jobTemplate.spec.template.spec");
  assert.ok(["Never", "OnFailure"].includes(pod.restartPolicy), "restartPolicy: Never (או OnFailure) — Always לא מותר ב־Job");
  assert.equal(pod.restartPolicy, "Never");
  const c = pod.containers?.[0];
  assert.ok(c, "containers");
  assert.equal(c.image, "ghcr.io/noa-cohen/coffee-shop:1.4.2");
  assert.ok(pinnedImage(c.image));
  assert.deepEqual(c.command, ["node", "dist/reports/nightly.js"]);
  assert.ok((c.envFrom ?? []).some((e) => e.secretRef?.name === "coffee-secrets"), "envFrom: secretRef coffee-secrets");
});
