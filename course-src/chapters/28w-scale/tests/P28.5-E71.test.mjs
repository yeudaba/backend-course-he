import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { load } from "../../tools/load.mjs";

const { gzipFile, countLinesGz } = await load(import.meta.url, "P28.5-E71.ts");

function tmp(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "e71-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("דוחס, ומחזיר גדלים", async (t) => {
  const dir = tmp(t);
  const src = path.join(dir, "orders.ndjson");
  const text = Array.from({ length: 20_000 }, (_, i) => JSON.stringify({ id: i, city: i % 2 ? "חיפה" : "באר שבע" })).join("\n") + "\n\n";
  fs.writeFileSync(src, text);
  const dst = path.join(dir, "orders.ndjson.gz");
  const r = await gzipFile(src, dst);
  assert.equal(r.inBytes, Buffer.byteLength(text));
  assert.equal(r.outBytes, fs.statSync(dst).size);
  assert.ok(r.outBytes < r.inBytes / 5);
  assert.equal(zlib.gunzipSync(fs.readFileSync(dst)).toString(), text);
  assert.equal(await countLinesGz(dst), 20_000);
});
test("מקור חסר — נדחה, בלי יעד שבור", async (t) => {
  const dir = tmp(t);
  const dst = path.join(dir, "x.gz");
  await assert.rejects(gzipFile(path.join(dir, "missing.ndjson"), dst));
  assert.equal(fs.existsSync(dst), false);
});
