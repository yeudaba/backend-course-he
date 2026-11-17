import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E64.mjs", ["splitArgs"])).splitArgs;

test("רווחים ומירכאות", async () => {
  const f = await get();
  assert.deepEqual(f(`curl -X POST 'http://x/a b' -H "Content-Type: application/json" -d '{"a":1}'`), ["curl", "-X", "POST", "http://x/a b", "-H", "Content-Type: application/json", "-d", '{"a":1}']);
  assert.deepEqual(f("  a   b\tc  "), ["a", "b", "c"], "רצף רווחים = מפריד אחד");
  assert.deepEqual(f(""), []);
});
test("בריחה במירכאות כפולות, ובודדות כמו שהן", async () => {
  const f = await get();
  assert.deepEqual(f(`-d "say \\"hi\\" \\\\ ok"`), ["-d", 'say "hi" \\ ok']);
  assert.deepEqual(f(`'a\\"b'`), ['a\\"b'], "בתוך ' לא מפענחים כלום");
  assert.deepEqual(f(`"it's"`), ["it's"]);
  assert.deepEqual(f(`'say "hi"'`), ['say "hi"']);
});
test("מירכאות צמודות וארגומנט ריק", async () => {
  const f = await get();
  assert.deepEqual(f(`-H"X: 1"`), ["-HX: 1"]);
  assert.deepEqual(f(`a'b c'"d e"f`), ["ab cd ef"]);
  assert.deepEqual(f(`x '' y ""`), ["x", "", "y", ""], "'' הוא ארגומנט ריק");
});
test("שבירת שורה עם \\ (Copy as cURL)", async () => {
  const f = await get();
  assert.deepEqual(f("curl 'http://x' \\\n  -H 'Accept: */*' \\\n  --compressed"), ["curl", "http://x", "-H", "Accept: */*", "--compressed"]);
  assert.deepEqual(f("a\nb"), ["a", "b"], "שורה חדשה מחוץ למירכאות מפרידה");
  assert.deepEqual(f("'a\nb'"), ["a\nb"], "בתוך מירכאות — שורה חדשה נשמרת");
});
test("מירכאה לא נסגרה", async () => {
  const f = await get();
  assert.throws(() => f(`curl -d '{"name":"O'Brien"}'`), { message: "מירכאה לא נסגרה" });
  assert.throws(() => f(`"abc`), { message: "מירכאה לא נסגרה" });
  assert.throws(() => f(`'abc`), { message: "מירכאה לא נסגרה" });
});
