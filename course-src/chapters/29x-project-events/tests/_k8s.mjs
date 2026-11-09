// עוזר לבדיקות של יחידה 26.3: קורא קובצי YAML של Kubernetes (גם כמה מסמכים בקובץ, מופרדים ב־---)
// ובודק אותם כמו ש־kubectl --dry-run היה בודק את החלקים החשובים — בלי cluster.
import fs from "node:fs";
import assert from "node:assert/strict";
import { parseAllDocuments } from "yaml";
import { target } from "../../tools/load.mjs";

export function readManifests(testUrl, file) {
  const text = fs.readFileSync(target(testUrl, file), "utf8");
  const docs = parseAllDocuments(text);
  for (const d of docs) if (d.errors.length) assert.fail(`YAML לא תקין: ${d.errors[0].message.split("\n")[0]}`);
  const objs = docs.map((d) => d.toJS()).filter((o) => o && typeof o === "object");
  assert.ok(objs.length > 0, "אין בקובץ אף אובייקט — עדיין לא כתבת manifest?");
  for (const o of objs) {
    assert.ok(o.apiVersion && o.kind, `לכל אובייקט צריך apiVersion ו־kind (חסר ב־${JSON.stringify(o).slice(0, 60)}…)`);
    assert.ok(o.metadata?.name, `ל־${o.kind} חסר metadata.name`);
  }
  return { text, objs };
}

export const find = (objs, kind, name) => objs.find((o) => o.kind === kind && (name === undefined || o.metadata.name === name));
export const all = (objs, kind) => objs.filter((o) => o.kind === kind);
export const need = (objs, kind, name) => {
  const o = find(objs, kind, name);
  assert.ok(o, `חסר ${kind}${name ? ` בשם ${name}` : ""}`);
  return o;
};

// selector.matchLabels ⊆ template.metadata.labels — אחרת ה־API server דוחה את ה־Deployment
export function labelsMatch(selector = {}, labels = {}) {
  const keys = Object.keys(selector);
  return keys.length > 0 && keys.every((k) => labels[k] === selector[k]);
}

export function checkWorkload(dep) {
  const sel = dep.spec?.selector?.matchLabels;
  const labels = dep.spec?.template?.metadata?.labels;
  assert.ok(sel && Object.keys(sel).length, `${dep.metadata.name}: חסר spec.selector.matchLabels`);
  assert.ok(labelsMatch(sel, labels), `${dep.metadata.name}: selector ${JSON.stringify(sel)} לא תואם ל־labels של ה־template ${JSON.stringify(labels)}`);
  const cs = dep.spec.template.spec?.containers ?? [];
  assert.ok(cs.length > 0, `${dep.metadata.name}: אין containers`);
  return cs;
}

// כמויות: "250m" ← 0.25 CPU, "512Mi" ← בתים
export function cpu(q) {
  if (q === undefined) return undefined;
  const s = String(q);
  return s.endsWith("m") ? Number(s.slice(0, -1)) / 1000 : Number(s);
}
const UNITS = { Ki: 2 ** 10, Mi: 2 ** 20, Gi: 2 ** 30, Ti: 2 ** 40, k: 1e3, M: 1e6, G: 1e9, T: 1e12 };
export function bytes(q) {
  if (q === undefined) return undefined;
  const m = /^(\d+(?:\.\d+)?)(Ki|Mi|Gi|Ti|k|M|G|T)?$/.exec(String(q));
  return m ? Number(m[1]) * (m[2] ? UNITS[m[2]] : 1) : NaN;
}

export function portOf(container, port) {
  if (typeof port === "number") return port;
  const p = (container.ports ?? []).find((x) => x.name === port);
  return p?.containerPort;
}

// image עם tag קבוע (לא latest ולא בלי tag)
export function pinnedImage(image = "") {
  const last = image.split("/").pop();
  if (last.includes("@sha256:")) return true;
  const tag = last.includes(":") ? last.split(":").pop() : "";
  return tag !== "" && tag !== "latest";
}
