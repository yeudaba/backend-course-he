import { test } from "node:test";
import assert from "node:assert/strict";
import { readManifests, find, need, all, checkWorkload, labelsMatch, portOf, cpu, bytes, pinnedImage } from "./_k8s.mjs";

const { objs } = readManifests(import.meta.url, "P26.3-E24.yaml");
const api = need(objs, "Deployment", "coffee-api");
const container = () => checkWorkload(api)[0];

test("Namespace coffee, וכל השאר בתוכו", () => {
  need(objs, "Namespace", "coffee");
  for (const o of objs.filter((o) => o.kind !== "Namespace")) assert.equal(o.metadata.namespace, "coffee", `${o.kind}/${o.metadata.name} — בלי namespace הוא נוחת ב־default`);
});
test("אין Secret עם ערכים בקובץ", () => {
  for (const s of all(objs, "Secret")) assert.ok(!s.data && !s.stringData, `Secret ${s.metadata.name} עם ערכים — הקובץ הזה ב־git`);
});
test("Deployment: image קבוע, probes, resources, לפחות 2 עותקים, לא root", () => {
  const c = container();
  assert.ok(pinnedImage(c.image), c.image);
  assert.ok(api.spec.replicas >= 2);
  assert.equal(c.readinessProbe?.httpGet?.path, "/ready");
  assert.equal(c.livenessProbe?.httpGet?.path, "/health");
  assert.equal(portOf(c, c.readinessProbe.httpGet.port), 3000);
  assert.ok(cpu(c.resources?.requests?.cpu) > 0 && bytes(c.resources?.requests?.memory) > 0 && bytes(c.resources?.limits?.memory) > 0);
  assert.equal({ ...api.spec.template.spec.securityContext, ...c.securityContext }.runAsNonRoot, true);
});
test("הגדרות: ConfigMap שקיים בקובץ, וסודות מ־coffee-secrets", () => {
  const c = container();
  for (const e of c.envFrom ?? []) if (e.configMapRef) assert.ok(find(objs, "ConfigMap", e.configMapRef.name), `ConfigMap ${e.configMapRef.name} לא קיים בקובץ`);
  assert.ok((c.envFrom ?? []).some((e) => e.configMapRef), "envFrom: configMapRef");
  const secret = (name) => (c.env ?? []).find((e) => e.name === name)?.valueFrom?.secretKeyRef;
  for (const [name, key] of [["DATABASE_URL", "database-url"], ["JWT_SECRET", "jwt-secret"], ["REDIS_URL", "redis-url"]]) {
    assert.deepEqual(secret(name), { name: "coffee-secrets", key }, name);
  }
});
test("Service ← ה־pods של ה־API, Ingress ← ה־Service, עם TLS", () => {
  const svc = need(objs, "Service", "coffee-api");
  assert.ok(labelsMatch(svc.spec.selector, api.spec.template.metadata.labels), "selector של ה־Service");
  const sp = svc.spec.ports[0];
  assert.equal(portOf(container(), sp.targetPort), 3000);
  const ing = need(objs, "Ingress");
  assert.equal(ing.apiVersion, "networking.k8s.io/v1");
  const rule = ing.spec.rules?.find((r) => r.host === "api.coffee.example");
  assert.ok(rule, "rule ל־api.coffee.example");
  const backend = rule.http.paths[0].backend.service;
  assert.equal(backend.name, "coffee-api");
  assert.ok(backend.port.number === sp.port || (backend.port.name && backend.port.name === sp.name), "הפורט של ה־backend — פורט של ה־Service (לא של הקונטיינר)");
  assert.ok(ing.spec.tls?.some((t) => t.hosts?.includes("api.coffee.example") && t.secretName), "tls עם secretName");
});
test("Job ל־migrations: אותו image, פעם אחת, לא לנצח", () => {
  const job = need(objs, "Job");
  const jc = job.spec.template.spec.containers[0];
  assert.equal(jc.image, container().image, "אותה גרסה — ה־migrations של הקוד שעולה");
  assert.match([jc.command, jc.args].flat().filter(Boolean).join(" "), /prisma migrate deploy/);
  assert.equal(job.spec.template.spec.restartPolicy, "Never");
  assert.ok(Number.isInteger(job.spec.backoffLimit) && job.spec.backoffLimit <= 3, "backoffLimit קטן");
  assert.ok((jc.env ?? []).some((e) => e.name === "DATABASE_URL" && e.valueFrom?.secretKeyRef), "DATABASE_URL מ־Secret");
});
test("HPA על ה־API, ו־rolling update בלי ירידה בזמינות", () => {
  const h = need(objs, "HorizontalPodAutoscaler");
  assert.equal(h.spec.scaleTargetRef?.name, "coffee-api");
  assert.ok(h.spec.minReplicas >= 2 && h.spec.maxReplicas > h.spec.minReplicas);
  assert.equal(api.spec.strategy?.rollingUpdate?.maxUnavailable, 0);
});
