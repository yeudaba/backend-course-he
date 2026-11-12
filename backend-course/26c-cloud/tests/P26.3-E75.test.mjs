import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import YAML from "yaml";
import { target } from "../../tools/load.mjs";

const base = {
  replicas: 1,
  image: { repository: "ghcr.io/noa-cohen/coffee-shop", tag: "" },
  resources: { requests: { cpu: "100m", memory: "128Mi" } },
  ingress: { enabled: false, host: "" },
  autoscaling: { enabled: false, minReplicas: 1, maxReplicas: 1 },
  logLevel: "info",
};
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const merge = (a, b) => { const o = structuredClone(a); for (const [k, v] of Object.entries(b)) { if (v === null) delete o[k]; else if (isObj(v) && isObj(o[k])) o[k] = merge(o[k], v); else o[k] = structuredClone(v); } return o; };
const prod = YAML.parse(fs.readFileSync(target(import.meta.url, "P26.3-E75.yaml"), "utf8")) ?? {};

test("התוצאה אחרי מיזוג", () => {
  assert.ok(isObj(prod) && Object.keys(prod).length, "הקובץ ריק");
  assert.deepEqual(merge(base, prod), {
    replicas: 3,
    image: { repository: "ghcr.io/noa-cohen/coffee-shop", tag: "1.5.0" },
    resources: { requests: { cpu: "250m", memory: "256Mi" }, limits: { memory: "512Mi" } },
    ingress: { enabled: true, host: "api.coffee.example" },
    autoscaling: { enabled: true, minReplicas: 3, maxReplicas: 10 },
    logLevel: "info",
  });
});
test("רק ההבדלים — אף ערך שזהה לבסיס", () => {
  const same = [];
  const walk = (p, b, path) => { for (const [k, v] of Object.entries(p)) { const bv = b?.[k]; if (isObj(v)) walk(v, bv, `${path}${k}.`); else if (JSON.stringify(v) === JSON.stringify(bv)) same.push(path + k); } };
  walk(prod, base, "");
  assert.deepEqual(same, [], `ערכים שזהים לבסיס: ${same.join(", ")}`);
  assert.equal(typeof prod.image?.tag, "string", 'tag כמחרוזת ("1.5.0")');
});
