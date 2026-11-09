import { test } from "node:test";
import assert from "node:assert/strict";
import { readManifests, need } from "./_k8s.mjs";

const { objs } = readManifests(import.meta.url, "P26.3-E11.yaml");

test("HPA: autoscaling/v2, מטרה coffee-api, 3–10, CPU 70%", () => {
  const h = need(objs, "HorizontalPodAutoscaler", "coffee-api");
  assert.equal(h.apiVersion, "autoscaling/v2");
  assert.deepEqual(h.spec.scaleTargetRef, { apiVersion: "apps/v1", kind: "Deployment", name: "coffee-api" });
  assert.equal(h.spec.minReplicas, 3);
  assert.equal(h.spec.maxReplicas, 10);
  const m = h.spec.metrics?.find((x) => x.type === "Resource" && x.resource?.name === "cpu");
  assert.ok(m, "metric מסוג Resource על cpu");
  assert.deepEqual(m.resource.target, { type: "Utilization", averageUtilization: 70 });
});
test("HPA: ירידה איטית (stabilization) — לא לקפוץ למטה אחרי דקה שקטה", () => {
  const h = need(objs, "HorizontalPodAutoscaler", "coffee-api");
  assert.ok(h.spec.behavior?.scaleDown?.stabilizationWindowSeconds >= 300);
});
test("PDB: תמיד לפחות 2 זמינים בזמן תחזוקה של nodes", () => {
  const pdb = need(objs, "PodDisruptionBudget", "coffee-api");
  assert.equal(pdb.apiVersion, "policy/v1");
  assert.equal(pdb.spec.minAvailable, 2);
  assert.deepEqual(pdb.spec.selector?.matchLabels, { app: "coffee-api" });
});
