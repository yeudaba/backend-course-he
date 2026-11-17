import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { saveWatermark, loadWatermark } = await load(import.meta.url, "P28.5-E92.ts");

function tmp(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "e92-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("שמירה וטעינה, תיקייה חדשה, בלי קובץ זמני", async (t) => {
  const dir = tmp(t);
  const file = path.join(dir, "state", "orders.wm.json");
  assert.equal(await loadWatermark(file), null);
  await saveWatermark(file, { updatedAt: "2026-10-01T10:00:00.000Z", id: 42 });
  assert.deepEqual(await loadWatermark(file), { updatedAt: "2026-10-01T10:00:00.000Z", id: 42 });
  await saveWatermark(file, { updatedAt: "2026-10-02T10:00:00.000Z", id: 7 });
  assert.deepEqual(await loadWatermark(file), { updatedAt: "2026-10-02T10:00:00.000Z", id: 7 });
  assert.deepEqual(fs.readdirSync(path.dirname(file)), ["orders.wm.json"]);
});
test("כתיבה דרך קובץ זמני ו־rename", async (t) => {
  const dir = tmp(t);
  const file = path.join(dir, "wm.json");
  const fsp = fs.promises;
  const calls = [];
  const origRename = fsp.rename;
  fsp.rename = async (a, b) => { calls.push([path.basename(a), path.basename(b)]); return origRename(a, b); };
  const { syncBuiltinESMExports } = await import("node:module");
  syncBuiltinESMExports();
  try {
    await saveWatermark(file, { updatedAt: "2026-10-01T00:00:00Z", id: 1 });
  } finally {
    fsp.rename = origRename;
    syncBuiltinESMExports();
  }
  assert.deepEqual(calls, [["wm.json.tmp", "wm.json"]]);
});
test("קובץ פגום ← שגיאה, לא null", async (t) => {
  const dir = tmp(t);
  const file = path.join(dir, "wm.json");
  fs.writeFileSync(file, "{not json");
  await assert.rejects(loadWatermark(file));
  fs.writeFileSync(file, JSON.stringify({ updatedAt: 5, id: 1 }));
  await assert.rejects(loadWatermark(file));
  fs.writeFileSync(file, JSON.stringify({ updatedAt: "2026-10-01", id: "1" }));
  await assert.rejects(loadWatermark(file));
});
