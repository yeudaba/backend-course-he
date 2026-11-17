import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_git.mjs";

const FILE = "P09-E76.js";
const get = () => exportsOf(import.meta.url, FILE, ["findSecrets"]);

test("הדוגמה מהמשימה", async () => {
  const { findSecrets } = await get();
  assert.deepEqual(findSecrets(['const stripe = "sk_live_51Hx9QzA";', "const apiKey = process.env.API_KEY;", 'const DB_PASSWORD = "hunter2";', "JWT_SECRET=", "const token = getToken();"].join("\n")), [
    { line: 1, kind: "stripe" },
    { line: 3, kind: "assignment" },
    { line: 5, kind: "assignment" },
  ]);
});
test("private key ו־.env", async () => {
  const { findSecrets } = await get();
  assert.deepEqual(findSecrets("# keys\n-----BEGIN RSA PRIVATE KEY-----\nabc\nAPI_KEY=xyz\nPORT=3000\nGITHUB_TOKEN=ghp_123"), [
    { line: 2, kind: "private-key" },
    { line: 4, kind: "assignment" },
    { line: 6, kind: "assignment" },
  ]);
});
test("בלי ממצאים", async () => {
  const { findSecrets } = await get();
  assert.deepEqual(findSecrets("const password = '';\nconst SECRET = process.env.SECRET;\nconst keyboard = 'mx';\nconsole.log(1)"), []);
  assert.deepEqual(findSecrets(""), []);
});
test("ממצא אחד לשורה", async () => {
  const { findSecrets } = await get();
  assert.deepEqual(findSecrets('const SECRET = "sk_live_x";'), [{ line: 1, kind: "stripe" }]);
});
