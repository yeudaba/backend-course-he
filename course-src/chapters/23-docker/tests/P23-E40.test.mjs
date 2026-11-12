import { test } from "node:test";
import assert from "node:assert/strict";
import { runScript } from "../../tools/shell.mjs";
import { fakeDocker } from "./_fakedocker.mjs";

const RUN = ["run", "-d", "--name", "dev-redis", "-p", "127.0.0.1:56379:6379", "-v", "dev-redis-data:/data", "--restart", "unless-stopped", "redis:8-alpine"];
const sameFlags = (got) => {
  assert.equal(got[0], "run");
  assert.equal(got.at(-1), "redis:8-alpine", "ה־image בסוף");
  const pairs = (a) => { const out = []; for (let i = 1; i < a.length - 1; i++) out.push(a[i].startsWith("-") && !["-d"].includes(a[i]) ? `${a[i]} ${a[++i]}` : a[i]); return out.sort(); };
  assert.deepEqual(pairs(got), pairs(RUN), "הדגלים של docker run");
};

test("אין קונטיינר ← run", (t) => {
  const d = fakeDocker(t, [{ match: "^ps -a", stdout: "old-dev-redis\ndev-redis-2\ndemo-db\n" }]);
  const r = runScript(import.meta.url, "P23-E40.sh", [], { env: d.env });
  assert.equal(r.status, 0, r.stderr);
  const calls = d.calls();
  assert.ok(calls[0][0] === "ps" && calls[0].includes("-a"), "קודם docker ps -a");
  assert.equal(calls.length, 2);
  sameFlags(calls[1]);
});
test("יש קונטיינר ← start", (t) => {
  const d = fakeDocker(t, [{ match: "^ps -a", stdout: "demo-db\ndev-redis\n" }]);
  const r = runScript(import.meta.url, "P23-E40.sh", [], { env: d.env });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(d.calls().at(-1), ["start", "dev-redis"]);
  assert.ok(!d.calls().some((c) => c[0] === "run"));
});
test("רשימה ריקה ← run", (t) => {
  const d = fakeDocker(t, [{ match: "^ps", stdout: "" }]);
  const r = runScript(import.meta.url, "P23-E40.sh", [], { env: d.env });
  assert.equal(r.status, 0, r.stderr);
  sameFlags(d.calls().at(-1));
});
