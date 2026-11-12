import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseImageRef, ecrInfo } = await load(import.meta.url, "P26.3-E40.ts");

test("Docker Hub וקיצורים", () => {
  assert.deepEqual(parseImageRef("node:24-alpine"), { registry: "docker.io", repository: "library/node", tag: "24-alpine", digest: null });
  assert.deepEqual(parseImageRef("nginx"), { registry: "docker.io", repository: "library/nginx", tag: null, digest: null });
  assert.deepEqual(parseImageRef("bitnami/redis:7.4"), { registry: "docker.io", repository: "bitnami/redis", tag: "7.4", digest: null });
});
test("registry עם נקודה, פורט, localhost ו־digest", () => {
  assert.deepEqual(parseImageRef("ghcr.io/noa-cohen/coffee-shop:1.4.2"), { registry: "ghcr.io", repository: "noa-cohen/coffee-shop", tag: "1.4.2", digest: null });
  assert.deepEqual(parseImageRef("localhost:5000/app"), { registry: "localhost:5000", repository: "app", tag: null, digest: null }, "5000 הוא פורט");
  assert.deepEqual(parseImageRef("localhost/app:dev"), { registry: "localhost", repository: "app", tag: "dev", digest: null });
  const d = "sha256:" + "a".repeat(64);
  assert.deepEqual(parseImageRef(`ghcr.io/x/y:1.0@${d}`), { registry: "ghcr.io", repository: "x/y", tag: "1.0", digest: d });
  assert.deepEqual(parseImageRef(`ghcr.io/x/y@${d}`), { registry: "ghcr.io", repository: "x/y", tag: null, digest: d });
});
test("ECR", () => {
  const ref = "123456789012.dkr.ecr.eu-central-1.amazonaws.com/coffee-shop:a1b2c3d";
  assert.deepEqual(parseImageRef(ref), { registry: "123456789012.dkr.ecr.eu-central-1.amazonaws.com", repository: "coffee-shop", tag: "a1b2c3d", digest: null });
  assert.deepEqual(ecrInfo(ref), { account: "123456789012", region: "eu-central-1" });
  assert.deepEqual(ecrInfo("210987654321.dkr.ecr.il-central-1.amazonaws.com/team/api"), { account: "210987654321", region: "il-central-1" });
  assert.equal(ecrInfo("ghcr.io/x/y:1"), null);
  assert.equal(ecrInfo("12345.dkr.ecr.eu-central-1.amazonaws.com/x"), null, "חשבון — 12 ספרות");
});
