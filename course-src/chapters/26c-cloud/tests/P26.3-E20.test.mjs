import { test } from "node:test";
import assert from "node:assert/strict";
import { readManifests, need, labelsMatch, portOf, cpu, bytes, pinnedImage } from "./_k8s.mjs";

const { objs } = readManifests(import.meta.url, "P26.3-E20.yaml");
const dep = need(objs, "Deployment", "coffee-api");
const c = dep.spec.template.spec.containers[0];

test("באג 1: selector תואם ל־labels של ה־template", () => {
  assert.ok(labelsMatch(dep.spec.selector?.matchLabels, dep.spec.template.metadata?.labels), "kubectl apply: `selector` does not match template `labels`");
});
test("באג 2: ה־probes בודקים את הפורט שהאפליקציה מאזינה לו", () => {
  assert.equal(portOf(c, c.readinessProbe.httpGet.port), 3000, "readiness על פורט אחר ← ה־pod לעולם לא Ready, ה־rollout נתקע");
  assert.equal(portOf(c, c.livenessProbe.httpGet.port), 3000);
});
test("באג 3: limit לא קטן מ־request", () => {
  const r = c.resources;
  if (r.limits?.cpu !== undefined) assert.ok(cpu(r.limits.cpu) >= cpu(r.requests.cpu), "limits.cpu < requests.cpu — ה־API server דוחה");
  assert.ok(bytes(r.limits.memory) >= bytes(r.requests.memory));
  assert.equal(cpu(r.requests.cpu), 0.5, "את ה־request לא משנים — רק את ה־limit");
});
test("באג 4: גרסה קבועה של image", () => {
  assert.ok(pinnedImage(c.image), `${c.image}: עם latest אי אפשר לדעת מה רץ, ו־rollback לא מחזיר כלום`);
  assert.match(c.image, /^ghcr\.io\/noa-cohen\/coffee-shop:/);
});
test("לא נשבר דבר אחר", () => {
  assert.equal(dep.spec.replicas, 3);
  assert.equal(c.readinessProbe.httpGet.path, "/ready");
  assert.equal(c.livenessProbe.httpGet.path, "/health");
});
