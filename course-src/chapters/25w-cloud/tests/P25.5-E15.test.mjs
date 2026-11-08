import { test } from "node:test";
import assert from "node:assert/strict";
import { readManifests, need } from "./_k8s.mjs";

const { objs } = readManifests(import.meta.url, "P25.5-E15.yaml");
const app = need(objs, "Application");

test("Application של Argo CD, ב־namespace של argocd", () => {
  assert.equal(app.apiVersion, "argoproj.io/v1alpha1");
  assert.equal(app.metadata.namespace, "argocd");
});
test("source: repo התצורה, ענף main, ה־chart וקובץ ה־values של prod", () => {
  const s = app.spec.source;
  assert.equal(s?.repoURL, "https://github.com/noa-cohen/coffee-deploy.git", "repo התצורה — לא repo הקוד");
  assert.equal(s.targetRevision, "main");
  assert.equal(s.path, "charts/coffee-api");
  assert.deepEqual(s.helm?.valueFiles, ["values-prod.yaml"]);
});
test("destination: ה־cluster שבו Argo CD רץ, namespace coffee", () => {
  assert.deepEqual(app.spec.destination, { server: "https://kubernetes.default.svc", namespace: "coffee" });
});
test("סנכרון אוטומטי: prune, selfHeal, ויצירת namespace", () => {
  assert.deepEqual(app.spec.syncPolicy?.automated, { prune: true, selfHeal: true });
  assert.ok(app.spec.syncPolicy.syncOptions?.includes("CreateNamespace=true"));
});
