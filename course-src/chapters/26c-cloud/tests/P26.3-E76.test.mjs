import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { appStatus } = await load(import.meta.url, "P26.3-E76.ts");
const dep = (spec, status) => ({ kind: "Deployment", name: "coffee-api", spec, status });
const svc = { kind: "Service", name: "coffee-api", spec: { selector: { app: "coffee-api" }, ports: [{ port: 80 }] } };
const ok = { replicas: 3, updatedReplicas: 3, availableReplicas: 3 };

test("Synced ו־Healthy — גם בסדר מפתחות אחר", () => {
  const desired = [dep({ replicas: 3, image: "x:1" }), svc];
  const live = [{ ...svc, spec: { ports: [{ port: 80 }], selector: { app: "coffee-api" } } }, dep({ image: "x:1", replicas: 3 }, ok)];
  assert.deepEqual(appStatus(desired, live), { sync: "Synced", health: "Healthy", outOfSync: [] });
});
test("OutOfSync: שינוי, חסר ועודף; Missing", () => {
  const desired = [dep({ replicas: 3, image: "x:2" }), svc, { kind: "ConfigMap", name: "cfg", spec: { a: "1" } }];
  const live = [dep({ replicas: 3, image: "x:1" }, ok), svc, { kind: "HorizontalPodAutoscaler", name: "old", spec: {} }];
  assert.deepEqual(appStatus(desired, live), { sync: "OutOfSync", health: "Missing", outOfSync: ["ConfigMap/cfg", "Deployment/coffee-api", "HorizontalPodAutoscaler/old"] });
});
test("Progressing ו־Degraded", () => {
  const desired = [dep({ replicas: 3 })];
  assert.equal(appStatus(desired, [dep({ replicas: 3 }, { updatedReplicas: 2, availableReplicas: 3 })]).health, "Progressing");
  assert.equal(appStatus(desired, [dep({ replicas: 3 }, { updatedReplicas: 3, availableReplicas: 2 })]).health, "Progressing");
  assert.equal(appStatus(desired, [dep({ replicas: 3 })]).health, "Progressing", "בלי status ← 0");
  const stuck = { updatedReplicas: 1, availableReplicas: 2, conditions: [{ type: "Progressing", status: "False", reason: "ProgressDeadlineExceeded" }] };
  const two = [dep({ replicas: 3 }), { kind: "Deployment", name: "worker", spec: { replicas: 1 } }];
  assert.equal(appStatus(two, [dep({ replicas: 3 }, ok), { kind: "Deployment", name: "worker", spec: { replicas: 1 }, status: stuck }]).health, "Degraded");
  assert.equal(appStatus(two, [dep({ replicas: 3 }, { updatedReplicas: 1 }), { kind: "Deployment", name: "worker", spec: { replicas: 1 }, status: stuck }]).health, "Degraded", "Degraded גובר על Progressing");
});
