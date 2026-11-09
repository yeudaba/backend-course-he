import { test } from "node:test";
import assert from "node:assert/strict";
import { readManifests, need, checkWorkload, cpu, bytes, portOf, pinnedImage } from "./_k8s.mjs";

const { objs } = readManifests(import.meta.url, "P26.3-E09.yaml");
const dep = need(objs, "Deployment", "coffee-api");

test("apiVersion, replicas ו־selector", () => {
  assert.equal(dep.apiVersion, "apps/v1");
  assert.equal(dep.spec.replicas, 3);
  assert.deepEqual(dep.spec.selector.matchLabels, { app: "coffee-api" });
  checkWorkload(dep);
});
const c = () => checkWorkload(dep)[0];
test("image עם גרסה קבועה ופורט 3000", () => {
  assert.ok(pinnedImage(c().image), `image "${c().image}" — tag קבוע, לא latest`);
  assert.match(c().image, /coffee-shop/);
  assert.ok((c().ports ?? []).some((p) => p.containerPort === 3000));
});
test("DATABASE_URL מ־Secret, לא בטקסט", () => {
  const e = (c().env ?? []).find((x) => x.name === "DATABASE_URL");
  assert.ok(e, "DATABASE_URL ב־env");
  assert.equal(e.value, undefined, "לא value: סיסמה בקובץ YAML שנמצא ב־git");
  assert.deepEqual(e.valueFrom?.secretKeyRef, { name: "coffee-secrets", key: "database-url" });
});
test("resources: requests ל־CPU ו־memory, ו־limit ל־memory", () => {
  const r = c().resources ?? {};
  assert.ok(cpu(r.requests?.cpu) > 0, "requests.cpu — לפיו ה־scheduler בוחר node");
  assert.ok(bytes(r.requests?.memory) > 0, "requests.memory");
  assert.ok(bytes(r.limits?.memory) >= bytes(r.requests.memory), "limits.memory ≥ requests.memory");
});
test("probes: readiness על /ready, liveness על /health — בפורט של האפליקציה", () => {
  const rd = c().readinessProbe?.httpGet;
  const lv = c().livenessProbe?.httpGet;
  assert.equal(rd?.path, "/ready");
  assert.equal(lv?.path, "/health");
  assert.equal(portOf(c(), rd.port), 3000);
  assert.equal(portOf(c(), lv.port), 3000);
});
test("לא root", () => {
  const sc = { ...dep.spec.template.spec.securityContext, ...c().securityContext };
  assert.equal(sc.runAsNonRoot, true);
});
