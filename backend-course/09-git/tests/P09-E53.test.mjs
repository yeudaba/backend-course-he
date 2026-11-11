import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_git.mjs";

const FILE = "P09-E53.js";
const get = () => exportsOf(import.meta.url, FILE, ["diffStat"]);

const TWO = `diff --git a/prices.js b/prices.js
index 987622f..5bf5592 100644
--- a/prices.js
+++ b/prices.js
@@ -1,2 +1,2 @@
 const VAT = 0.18;
-const SHIPPING = 25;
+const SHIPPING = 30;
diff --git a/README.md b/README.md
index 1111111..2222222 100644
--- a/README.md
+++ b/README.md
@@ -1 +1,3 @@
 # Shop
+
+Run with node index.js`;
test("שני קבצים", async () => {
  const { diffStat } = await get();
  assert.deepEqual(diffStat(TWO), { files: 2, added: 3, removed: 1 });
});
test("שורה שהתוכן שלה מתחיל ב־-- או ++", async () => {
  const { diffStat } = await get();
  const d = "diff --git a/x b/x\n--- a/x\n+++ b/x\n@@ -1 +1 @@\n---count\n++++count";
  assert.deepEqual(diffStat(d), { files: 1, added: 0, removed: 0 }, "כאן גם השורות האלה מתחילות ב־--- / +++ — לפי הכלל, לא נספרות");
});
test("ריק", async () => {
  const { diffStat } = await get();
  assert.deepEqual(diffStat(""), { files: 0, added: 0, removed: 0 });
});
