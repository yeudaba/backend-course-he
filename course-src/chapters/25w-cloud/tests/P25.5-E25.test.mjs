import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAllDocuments } from "yaml";
import { load } from "../../tools/load.mjs";

const { bumpImageTag } = await load(import.meta.url, "P25.5-E25.ts");
const REPO = "ghcr.io/noa-cohen/coffee-shop";
const input = `# coffee-shop — production. נערך ע״י CI, אל תשנה ידנית את ה־image
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coffee-api # ה־API
spec:
  replicas: 3
  template:
    spec:
      initContainers:
        - name: wait-db
          image: busybox:1.37
      containers:
        - name: api
          image: ghcr.io/noa-cohen/coffee-shop:1.4.2 # מתעדכן אוטומטית
        - name: web
          image: ghcr.io/noa-cohen/coffee-shop-web:1.0.0
---
apiVersion: batch/v1
kind: Job
metadata:
  name: coffee-migrate
spec:
  template:
    spec:
      containers:
        - name: migrate
          image: "ghcr.io/noa-cohen/coffee-shop@sha256:0f1e2d3c"
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-report
spec:
  schedule: "0 3 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: report
              image: ghcr.io/noa-cohen/coffee-shop:1.4.2
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: notes
data:
  image: ghcr.io/noa-cohen/coffee-shop:1.4.2
`;
const images = (text) =>
  parseAllDocuments(text).map((d) => JSON.stringify(d.toJS())).join("\n").match(/"image":"[^"]+"/g);

test("מעדכן את כל ה־containers של ה־repo — Deployment, Job, CronJob", () => {
  const r = bumpImageTag(input, REPO, "1.5.0");
  assert.equal(r.changed, 3);
  assert.deepEqual(images(r.text), [
    '"image":"busybox:1.37"',
    '"image":"ghcr.io/noa-cohen/coffee-shop:1.5.0"',
    '"image":"ghcr.io/noa-cohen/coffee-shop-web:1.0.0"',
    '"image":"ghcr.io/noa-cohen/coffee-shop:1.5.0"',
    '"image":"ghcr.io/noa-cohen/coffee-shop:1.5.0"',
    '"image":"ghcr.io/noa-cohen/coffee-shop:1.4.2"',
  ]);
});
test("ההערות והמבנה נשמרים — זה diff של שורה ב־pull request, לא קובץ חדש", () => {
  const r = bumpImageTag(input, REPO, "1.5.0");
  const a = input.split("\n");
  const b = r.text.split("\n");
  assert.equal(b.length, a.length, "אותו מספר שורות");
  const diff = a.map((l, i) => [l, b[i]]).filter(([x, y]) => x !== y);
  assert.equal(diff.length, 3, `רק 3 שורות משתנות:\n${diff.map(([x, y]) => `- ${x}\n+ ${y}`).join("\n")}`);
  assert.ok(r.text.includes("# מתעדכן אוטומטית") && r.text.includes("אל תשנה ידנית"));
});
test("לא נוגע ב־ConfigMap, ולא ב־repo שרק מתחיל באותו שם", () => {
  const r = bumpImageTag(input, REPO, "1.5.0");
  assert.match(r.text, /coffee-shop-web:1\.0\.0/);
  assert.match(r.text, /image: ghcr\.io\/noa-cohen\/coffee-shop:1\.4\.2\n$/, "ConfigMap הוא נתונים, לא pod");
});
test("פעמיים אותו tag ← 0 שינויים, אותו טקסט", () => {
  const once = bumpImageTag(input, REPO, "1.5.0").text;
  const twice = bumpImageTag(once, REPO, "1.5.0");
  assert.equal(twice.changed, 0);
  assert.equal(twice.text, once);
});
test("tag לא תקין, או repo שלא קיים ← שגיאה", () => {
  for (const bad of ["", "1.5.0; rm -rf /", "a/b", ":1", "x".repeat(129)]) assert.throws(() => bumpImageTag(input, REPO, bad), undefined, bad);
  assert.throws(() => bumpImageTag(input, "ghcr.io/noa-cohen/other", "1.5.0"));
});
test("registry עם port", () => {
  const t = "kind: Deployment\nspec:\n  template:\n    spec:\n      containers:\n        - name: a\n          image: localhost:5000/coffee:1.0\n";
  assert.match(bumpImageTag(t, "localhost:5000/coffee", "2.0").text, /image: localhost:5000\/coffee:2\.0/);
});
