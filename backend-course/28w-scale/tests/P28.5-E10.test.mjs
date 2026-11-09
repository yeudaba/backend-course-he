import { test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { load } from "../../tools/load.mjs";

const { ndjsonParser } = await load(import.meta.url, "P28.5-E10.ts");

async function parse(chunks) {
  const out = [];
  await pipeline(Readable.from(chunks), ndjsonParser(), async function* (src) {
    for await (const o of src) out.push(o);
  });
  return out;
}

test("שורה שלמה בכל chunk", async () => {
  assert.deepEqual(await parse([Buffer.from('{"a":1}\n{"a":2}\n')]), [{ a: 1 }, { a: 2 }]);
});
test("שורה שנחתכה בין chunks", async () => {
  const text = '{"id":1,"name":"Dana"}\n{"id":2,"name":"Yossi"}\n{"id":3}\n';
  const bytes = Buffer.from(text);
  for (const size of [1, 3, 7, 16]) {
    const chunks = [];
    for (let i = 0; i < bytes.length; i += size) chunks.push(bytes.subarray(i, i + size));
    assert.deepEqual((await parse(chunks)).map((o) => o.id), [1, 2, 3], `chunks של ${size} בתים`);
  }
});
test("תו עברי שנחתך באמצע (2 בתים ב־UTF-8)", async () => {
  const bytes = Buffer.from('{"city":"חיפה"}\n');
  const cut = bytes.indexOf(Buffer.from("י")) + 1; // באמצע ה־י
  assert.deepEqual(await parse([bytes.subarray(0, cut), bytes.subarray(cut)]), [{ city: "חיפה" }]);
});
test("שורה אחרונה בלי \\n, שורות ריקות, ו־\\r\\n", async () => {
  assert.deepEqual(await parse([Buffer.from('{"a":1}\r\n\n{"a":2}')]), [{ a: 1 }, { a: 2 }]);
});
test("JSON פגום ← שגיאה עם מספר השורה", async () => {
  await assert.rejects(parse([Buffer.from('{"a":1}\n{oops\n{"a":3}\n')]), /2/);
});
