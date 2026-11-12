import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { validateValues } = await load(import.meta.url, "P26.3-E83.ts");
const good = () => ({
  replicas: 3,
  image: { repository: "ghcr.io/noa-cohen/coffee-shop", tag: "1.5.0" },
  resources: { requests: { cpu: "250m", memory: "256Mi" }, limits: { memory: "512Mi" } },
  ingress: { enabled: true, host: "api.coffee.example" },
  autoscaling: { enabled: true, minReplicas: 3, maxReplicas: 10 },
});
const paths = (v) => validateValues(v).map((e) => e.path).sort();

test("תקין ← []", () => {
  assert.deepEqual(validateValues(good()), []);
  const v = good(); v.ingress = { enabled: false }; v.autoscaling = { enabled: false };
  assert.deepEqual(validateValues(v), [], "ingress כבוי — לא צריך host");
  const w = good(); delete w.ingress; delete w.autoscaling;
  assert.deepEqual(validateValues(w), []);
});
test("שדות בסיס", () => {
  const v = good(); v.replicas = 0; v.image.tag = "latest"; v.resources.limits = {};
  assert.deepEqual(paths(v), ["image.tag", "replicas", "resources.limits.memory"]);
  const w = good(); w.replicas = 2.5; w.image.repository = ""; w.resources.requests.cpu = "";
  assert.deepEqual(paths(w), ["image.repository", "replicas", "resources.requests.cpu"]);
  for (const e of validateValues(v)) assert.ok(typeof e.message === "string" && e.message.length);
});
test("תנאים תלויים", () => {
  for (const host of ["api coffee.example", "localhost", "", "API.coffee.example"]) {
    const v = good(); v.ingress.host = host;
    assert.deepEqual(paths(v), ["ingress.host"], host);
  }
  const a = good(); a.autoscaling = { enabled: true, minReplicas: 1, maxReplicas: 5 };
  assert.deepEqual(paths(a), ["autoscaling.minReplicas"]);
  const b = good(); b.autoscaling = { enabled: true, minReplicas: 6, maxReplicas: 5 };
  assert.deepEqual(paths(b), ["autoscaling.maxReplicas"]);
});
