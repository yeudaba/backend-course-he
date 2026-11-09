import { test } from "node:test";
import assert from "node:assert/strict";
import { readManifests, need, labelsMatch, portOf } from "./_k8s.mjs";

const { objs, text } = readManifests(import.meta.url, "P26.3-E10.yaml");

test("ConfigMap: הערכים, כולם מחרוזות", () => {
  const cm = need(objs, "ConfigMap", "coffee-config");
  assert.deepEqual(cm.data, { LOG_LEVEL: "info", PORT: "3000", CORS_ORIGINS: "https://shop.coffee.example", TRUST_PROXY: "1" });
  assert.match(text, /PORT:\s*["']3000["']/, 'PORT: "3000" במרכאות — מספר ב־data נדחה ע״י ה־API server');
});
test("ה־Deployment טוען את ה־ConfigMap", () => {
  const dep = need(objs, "Deployment", "coffee-api");
  const refs = dep.spec.template.spec.containers.flatMap((c) => (c.envFrom ?? []).map((e) => e.configMapRef?.name));
  assert.ok(refs.includes("coffee-config"), "envFrom: configMapRef: coffee-config");
});
test("Service: ClusterIP, פורט 80 ← 3000, ובוחר את ה־pods", () => {
  const svc = need(objs, "Service", "coffee-api");
  const dep = need(objs, "Deployment", "coffee-api");
  assert.equal(svc.spec.type ?? "ClusterIP", "ClusterIP", "פנימי — מבחוץ נכנסים דרך Ingress");
  assert.ok(labelsMatch(svc.spec.selector, dep.spec.template.metadata.labels), "selector של ה־Service חייב להתאים ל־labels של ה־pods — אחרת אין endpoints");
  const [port] = svc.spec.ports;
  assert.equal(port.port, 80);
  assert.equal(portOf(dep.spec.template.spec.containers[0], port.targetPort), 3000, "targetPort — הפורט של הקונטיינר");
});
