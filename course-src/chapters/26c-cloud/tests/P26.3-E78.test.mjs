import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { syncWaves } = await load(import.meta.url, "P26.3-E78.ts");
const o = (kind, name, wave) => ({ kind, metadata: { name, ...(wave === undefined ? {} : { annotations: { "argocd.argoproj.io/sync-wave": wave } }) } });

test("גלים, ובתוך גל — לפי סוג ושם", () => {
  const objs = [o("Deployment", "coffee-api"), o("Ingress", "coffee"), o("Job", "migrate", "-1"), o("Service", "coffee-api"), o("ConfigMap", "cfg", "-1"), o("Namespace", "coffee", "-2"), o("HorizontalPodAutoscaler", "api"), o("Secret", "b"), o("Secret", "a"), o("Job", "seed", "10"), o("CronJob", "report", "2")];
  assert.deepEqual(syncWaves(objs), [
    ["Namespace/coffee"],
    ["ConfigMap/cfg", "Job/migrate"],
    ["Secret/a", "Secret/b", "Service/coffee-api", "Deployment/coffee-api", "Ingress/coffee", "HorizontalPodAutoscaler/api"],
    ["CronJob/report"],
    ["Job/seed"],
  ]);
  assert.deepEqual(syncWaves([]), []);
});
test("גל לא תקין ← שגיאה עם השם", () => {
  assert.throws(() => syncWaves([o("Job", "migrate", "first")]), /migrate/);
  assert.throws(() => syncWaves([o("Job", "x", "1.5")]));
});
