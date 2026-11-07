import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { run } = await load(import.meta.url, "P13-E14.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

const call = (argv) => { const out = [], err = []; const code = run(argv, { log: (m) => out.push(m), error: (m) => err.push(m) }); return { code, out, err }; };
test("הצלחה", () => { assert.deepEqual(call(["--name", "דנה"]), { code: 0, out: ["שלום, דנה!"], err: [] }); assert.deepEqual(call(["--name=Dana", "--times", "2", "--shout"]).out, ["שלום, DANA!", "שלום, DANA!"]); });
test("שגיאות שימוש — קוד 2", () => {
  assert.deepEqual(call([]), { code: 2, out: [], err: ["חסר --name"] });
  assert.deepEqual(call(["--name", "a", "--times", "11"]).err, ["--times חייב להיות בין 1 ל־10"]);
  assert.deepEqual(call(["--name", "a", "--times", "x"]).code, 2);
  assert.deepEqual(call(["--name", "a", "--color", "red"]), { code: 2, out: [], err: ["דגל לא מוכר: --color"] });
});
