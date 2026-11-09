import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parseAllDocuments, parse as parseYaml } from "yaml";
import { fileP } from "./_events.mjs";
import { checkWorkload, labelsMatch, portOf, pinnedImage, bytes } from "./_k8s.mjs";

// פרויקט 4, שלב 4: Docker, Kubernetes ו־CI — קריאה של הקבצים, בלי cluster
const root = path.dirname(fileP(import.meta.url, "package.json"));
const read = (rel) => {
  const p = path.join(root, rel);
  assert.ok(fs.existsSync(p), `חסר ${rel}`);
  return fs.readFileSync(p, "utf8");
};
function manifests() {
  const dir = path.join(root, "k8s");
  assert.ok(fs.existsSync(dir), "חסרה תיקיית k8s/");
  const objs = fs.readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).flatMap((f) => parseAllDocuments(fs.readFileSync(path.join(dir, f), "utf8")).map((d) => d.toJS())).filter(Boolean);
  assert.ok(objs.length, "אין manifests ב־k8s/");
  return objs;
}
const find = (objs, kind, name) => objs.find((o) => o.kind === kind && o.metadata?.name === name);
const podSpec = (o) => (o.kind === "CronJob" ? o.spec.jobTemplate.spec.template.spec : o.spec.template.spec);

test("Dockerfile: Node 24, npm ci בלי dev, לא root; ו־.dockerignore", () => {
  const d = read("Dockerfile");
  assert.match(d, /^FROM node:24/m);
  assert.match(d, /npm ci[^\n]*--omit=dev/);
  assert.match(d, /^USER (node|\d+)/m, "USER — לא root");
  const ignore = read(".dockerignore");
  assert.match(ignore, /node_modules/);
  assert.match(ignore, /\.env/);
});
test("ארבעה רכיבים, אותו image עם גרסה, ופקודה לכל אחד", () => {
  const objs = manifests();
  const comps = { ingest: find(objs, "Deployment", "ingest"), processor: find(objs, "Deployment", "processor"), query: find(objs, "Deployment", "query"), export: find(objs, "CronJob", "export") };
  for (const [n, o] of Object.entries(comps)) assert.ok(o, `חסר ${n === "export" ? "CronJob" : "Deployment"} בשם ${n}`);
  const images = new Set();
  for (const [n, o] of Object.entries(comps)) {
    const c = podSpec(o).containers[0];
    assert.ok(pinnedImage(c.image), `${n}: image עם גרסה קבועה`);
    images.add(c.image);
    assert.match([c.command, c.args].flat().filter(Boolean).join(" "), new RegExp(`main-${n}`), `${n}: מריץ את main-${n}`);
    assert.ok(bytes(c.resources?.limits?.memory) > 0, `${n}: limit לזיכרון`);
    assert.equal({ ...podSpec(o).securityContext, ...c.securityContext }.runAsNonRoot, true, `${n}: לא root`);
    const env = c.env ?? [];
    for (const name of ["MYSQL_URL", "API_KEYS"]) assert.ok(env.some((e) => e.name === name && e.valueFrom?.secretKeyRef), `${n}: ${name} מ־Secret`);
  }
  assert.equal(images.size, 1, "image אחד לכל הרכיבים");
  for (const o of objs.filter((o) => o.kind === "Secret")) assert.ok(!o.data && !o.stringData, "Secret עם ערכים ב־Git");
});
test("ingest ו־query: probes, Service ו־HPA ל־ingest; processor בלי Service", () => {
  const objs = manifests();
  for (const n of ["ingest", "query"]) {
    const d = find(objs, "Deployment", n);
    const c = checkWorkload(d)[0];
    assert.ok(c.readinessProbe?.httpGet && c.livenessProbe?.httpGet, `${n}: readiness ו־liveness`);
    const svc = objs.find((o) => o.kind === "Service" && labelsMatch(o.spec.selector, d.spec.template.metadata.labels));
    assert.ok(svc, `${n}: Service שבוחר את ה־pods`);
    assert.equal(portOf(c, svc.spec.ports[0].targetPort), c.ports[0].containerPort);
  }
  const proc = find(objs, "Deployment", "processor");
  assert.ok(!objs.some((o) => o.kind === "Service" && labelsMatch(o.spec.selector, proc.spec.template.metadata.labels)), "processor לא מקבל בקשות — אין לו Service");
  const hpa = objs.find((o) => o.kind === "HorizontalPodAutoscaler" && o.spec.scaleTargetRef?.name === "ingest");
  assert.ok(hpa, "HPA ל־ingest");
  assert.ok(hpa.spec.maxReplicas > hpa.spec.minReplicas);
  const cron = find(objs, "CronJob", "export");
  assert.equal(cron.spec.concurrencyPolicy, "Forbid", "export: לא שתי ריצות במקביל");
  const ing = objs.find((o) => o.kind === "Ingress");
  assert.ok(ing?.spec.tls?.length, "Ingress עם TLS");
});
test("CI: npm ci, typecheck או בדיקות, ובניית image", () => {
  const wfDir = path.join(root, ".github", "workflows");
  const jf = path.join(root, "Jenkinsfile");
  let text;
  if (fs.existsSync(wfDir) && fs.readdirSync(wfDir).some((f) => /\.ya?ml$/.test(f))) {
    const f = fs.readdirSync(wfDir).find((x) => /\.ya?ml$/.test(x));
    text = fs.readFileSync(path.join(wfDir, f), "utf8");
    const wf = parseYaml(text);
    assert.ok(wf.jobs && Object.keys(wf.jobs).length, "workflow עם jobs");
  } else {
    assert.ok(fs.existsSync(jf), "חסר CI: .github/workflows/*.yml או Jenkinsfile");
    text = fs.readFileSync(jf, "utf8");
  }
  assert.match(text, /npm ci/);
  assert.match(text, /npm (run typecheck|test)/);
  assert.match(text, /docker build/);
});
