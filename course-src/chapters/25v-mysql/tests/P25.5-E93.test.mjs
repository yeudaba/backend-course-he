import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P25.5-E93.ts", ["uuidToBin", "binToUuid", "uuidv7"]);

test("כמו UUID_TO_BIN / BIN_TO_UUID של MySQL", async (t) => {
  const { uuidToBin, binToUuid } = await get();
  const db = await mysqlSandbox(t, import.meta.url);
  for (let i = 0; i < 5; i++) {
    const u = randomUUID();
    const [row] = await db.rows("SELECT HEX(UUID_TO_BIN(?)) AS h, BIN_TO_UUID(UNHEX(?)) AS back", [u, uuidToBin(u).toString("hex")]);
    assert.equal(uuidToBin(u).toString("hex").toUpperCase(), row.h);
    assert.equal(row.back, u);
    assert.equal(binToUuid(uuidToBin(u.toUpperCase())), u);
  }
  for (const bad of ["", "not-a-uuid", randomUUID().replaceAll("-", ""), randomUUID() + "0", randomUUID().replace(/^./, "g")]) {
    assert.throws(() => uuidToBin(bad), RangeError, bad);
  }
});
test("uuidv7 — פורמט, גרסה, וסדר במסד", async (t) => {
  const { uuidv7, uuidToBin } = await get();
  const t0 = Date.UTC(2026, 10, 7, 12);
  const id = uuidv7(t0, Buffer.alloc(16, 0xff));
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(parseInt(id.replaceAll("-", "").slice(0, 12), 16), t0, "48 הביטים הראשונים = הזמן");
  assert.equal(uuidv7(t0, Buffer.alloc(16, 0)).replaceAll("-", "").slice(12), "700080000000000000000".slice(0, 20));
  const db = await mysqlSandbox(t, import.meta.url);
  await db.query("CREATE TABLE u (id BINARY(16) PRIMARY KEY, n INT)");
  const ids = Array.from({ length: 30 }, (_, i) => uuidv7(t0 + i * 1000, randomBytes(16)));
  const shuffled = ids.map((id, n) => ({ id, n })).sort(() => Math.random() - 0.5);
  for (const { id, n } of shuffled) await db.query("INSERT INTO u VALUES (?, ?)", [uuidToBin(id), n]);
  assert.deepEqual((await db.rows("SELECT n FROM u ORDER BY id")).map((r) => r.n), ids.map((_, n) => n), "ORDER BY id = סדר הזמן");
});
