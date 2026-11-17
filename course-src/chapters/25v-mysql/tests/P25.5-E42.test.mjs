import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P25.5-E42.ts", ["mysqlLength", "columnProblems"]);
const SAMPLES = ["", "abc", "חם 🔥", "קפה ☕", "👨‍👩‍👧", "Café", "א".repeat(200), "𝔘𝔫𝔦"];

test("mysqlLength — כמו CHAR_LENGTH ו־LENGTH של MySQL", async (t) => {
  const { mysqlLength } = await get();
  const db = await mysqlSandbox(t, import.meta.url);
  for (const s of SAMPLES) {
    const [row] = await db.rows("SELECT CHAR_LENGTH(CONVERT(? USING utf8mb4)) AS chars, LENGTH(CONVERT(? USING utf8mb4)) AS bytes", [s, s]);
    assert.deepEqual(mysqlLength(s), { chars: Number(row.chars), bytes: Number(row.bytes) }, JSON.stringify(s));
  }
});
test("columnProblems", async () => {
  const { columnProblems } = await get();
  assert.deepEqual(columnProblems("קפה ☕", { maxChars: 5, charset: "utf8mb3" }), []);
  assert.deepEqual(columnProblems("חם 🔥!", { maxChars: 5, charset: "utf8mb3" }), ["needs-utf8mb4"], "5 תווים");
  assert.deepEqual(columnProblems("חם 🔥!!", { maxChars: 4, charset: "utf8mb3" }), ["too-long", "needs-utf8mb4"]);
  assert.deepEqual(columnProblems("חם 🔥!!", { maxChars: 4, charset: "utf8mb4" }), ["too-long"]);
  assert.deepEqual(columnProblems("🔥🔥🔥", { maxChars: 3, charset: "utf8mb4" }), [], "3 תווים — לא 6");
  assert.deepEqual(columnProblems("א".repeat(200), { maxChars: 200, charset: "utf8mb3" }), []);
});
