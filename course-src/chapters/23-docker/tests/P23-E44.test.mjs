import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P23-E44.ts", ["parseImageRef"])).parseImageRef;
const D = "sha256:" + "a".repeat(64);

test("צורות שונות", async () => {
  const p = await get();
  const cases = [
    ["postgres:18-alpine", "docker.io", "library/postgres", "18-alpine", null],
    ["node", "docker.io", "library/node", "latest", null],
    ["dana/tasks-api", "docker.io", "dana/tasks-api", "latest", null],
    ["ghcr.io/dana/tasks-api:1.2.0", "ghcr.io", "dana/tasks-api", "1.2.0", null],
    ["localhost:5000/app:dev", "localhost:5000", "app", "dev", null],
    ["localhost/app", "localhost", "app", "latest", null],
    ["registry.example.com:5000/team/api", "registry.example.com:5000", "team/api", "latest", null],
    [`postgres@${D}`, "docker.io", "library/postgres", null, D],
    [`postgres:18-alpine@${D}`, "docker.io", "library/postgres", "18-alpine", D],
    ["dana/sub/deep:v1", "docker.io", "dana/sub/deep", "v1", null],
  ];
  for (const [ref, registry, repository, tag, digest] of cases) assert.deepEqual(p(ref), { registry, repository, tag, digest }, ref);
});
test("לא תקין", async () => {
  const p = await get();
  for (const bad of ["", "my image", "Dana/api", "postgres:", "Postgres:18"]) assert.throws(() => p(bad), { message: `שם לא תקין: ${bad}` });
});
