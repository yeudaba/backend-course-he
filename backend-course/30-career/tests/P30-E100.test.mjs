import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "../../tools/load.mjs";

const { diffSize } = await load(import.meta.url, "P30-E100.ts");

test("diff קטן, כולל קובץ שנמחק", () => {
  const diff = `diff --git a/src/a.ts b/src/a.ts
index 1..2 100644
--- a/src/a.ts
+++ b/src/a.ts
@@ -1,3 +1,4 @@
 keep
-old
+new
+more
diff --git a/old.ts b/old.ts
deleted file mode 100644
--- a/old.ts
+++ /dev/null
@@ -1,2 +0,0 @@
-x
-y
diff --git a/new.ts b/new.ts
new file mode 100644
--- /dev/null
+++ b/new.ts
@@ -0,0 +1 @@
+hello`;
  assert.deepEqual(diffSize(diff), { files: [{ file: "src/a.ts", added: 2, removed: 1 }, { file: "old.ts", added: 0, removed: 2 }, { file: "new.ts", added: 1, removed: 0 }], changed: 6, verdict: "small" });
});
test("large — לפי שורות או לפי קבצים", () => {
  const many = (n, lines) => Array.from({ length: n }, (_, i) => `--- a/f${i}\n+++ b/f${i}\n@@\n` + "+x\n".repeat(lines)).join("");
  assert.equal(diffSize(many(1, 61)).verdict, "large");
  assert.equal(diffSize(many(1, 60)).verdict, "small");
  assert.equal(diffSize(many(6, 1)).verdict, "large");
  assert.equal(diffSize(many(5, 12)).verdict, "small");
  assert.deepEqual(diffSize(""), { files: [], changed: 0, verdict: "small" });
});
test("על הקובץ מ־E29", () => {
  const p = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "files", "ai-diff.txt");
  const r = diffSize(fs.readFileSync(p, "utf8"));
  assert.ok(r.files.length >= 2);
  assert.equal(r.changed, r.files.reduce((s, f) => s + f.added + f.removed, 0));
});
