import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { load } from "../../tools/load.mjs";

const { configChecksum, withConfigChecksum } = await load(import.meta.url, "P26.3-E77.ts");
const sha = (s) => createHash("sha256").update(s).digest("hex");

test("configChecksum", () => {
  assert.equal(configChecksum({ PORT: "3000", LOG_LEVEL: "info" }), sha("LOG_LEVEL=info\nPORT=3000\n"));
  assert.equal(configChecksum({ LOG_LEVEL: "info", PORT: "3000" }), configChecksum({ PORT: "3000", LOG_LEVEL: "info" }), "סדר לא משנה");
  assert.notEqual(configChecksum({ LOG_LEVEL: "debug", PORT: "3000" }), configChecksum({ LOG_LEVEL: "info", PORT: "3000" }));
  assert.equal(configChecksum({}), sha(""));
});
test("withConfigChecksum — עותק, ב־template", () => {
  const d = { kind: "Deployment", metadata: { name: "coffee-api" }, spec: { replicas: 3, template: { metadata: { labels: { app: "coffee-api" }, annotations: { team: "shop" } }, spec: { containers: [] } } } };
  const before = structuredClone(d);
  const out = withConfigChecksum(d, { A: "1" });
  assert.deepEqual(d, before, "המקור לא השתנה");
  assert.deepEqual(out.spec.template.metadata.annotations, { team: "shop", "checksum/config": sha("A=1\n") });
  assert.equal(out.metadata.annotations, undefined, "לא ב־metadata של ה־Deployment");
  const bare = withConfigChecksum({ spec: { template: { spec: {} } } }, { B: "2" });
  assert.equal(bare.spec.template.metadata.annotations["checksum/config"], sha("B=2\n"));
});
