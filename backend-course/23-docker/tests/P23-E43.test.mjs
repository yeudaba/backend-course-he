import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P23-E43.ts", ["parsePorts"])).parsePorts;

test("פירוק", async () => {
  const parsePorts = await get();
  assert.deepEqual(parsePorts("0.0.0.0:55432->5432/tcp, [::]:55432->5432/tcp"), [
    { hostIp: "0.0.0.0", hostPort: 55432, containerPort: 5432, protocol: "tcp" },
    { hostIp: "::", hostPort: 55432, containerPort: 5432, protocol: "tcp" },
  ]);
  assert.deepEqual(parsePorts("127.0.0.1:8080->3000/tcp"), [{ hostIp: "127.0.0.1", hostPort: 8080, containerPort: 3000, protocol: "tcp" }]);
  assert.deepEqual(parsePorts("5432/tcp, 0.0.0.0:5353->53/udp"), [{ hostIp: "0.0.0.0", hostPort: 5353, containerPort: 53, protocol: "udp" }], "port בלי -> מדלגים");
  assert.deepEqual(parsePorts(""), []);
  assert.deepEqual(parsePorts("   "), []);
});
test("לא מובן", async () => {
  const parsePorts = await get();
  for (const bad of ["0.0.0.0:abc->5432/tcp", "0.0.0.0:1->2/sctp", "hello"]) assert.throws(() => parsePorts(bad), { message: `לא מובן: ${bad}` });
});
