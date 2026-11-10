import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_git.mjs";

const get = () => exportsOf(import.meta.url, "P09-E28.js", ["isIgnored"]);
const GI = "\n# תלויות\nnode_modules/\n*.log\n.env\n";

const check = (isIgnored, gitignore, cases) => {
  for (const [p, expected] of cases) assert.equal(isIgnored(p, gitignore), expected, `isIgnored("${p}") צריכה להחזיר ${expected}`);
};

test("הדוגמאות מהמשימה", async () => {
  const { isIgnored } = await get();
  check(isIgnored, GI, [
    ["node_modules/lodash/index.js", true],
    ["src/app.log", true],
    ["config/.env", true],
    [".env.example", false],
    ["src/index.js", false],
  ]);
});
test("תיקייה: בהתחלה או באמצע, לא כחלק משם", async () => {
  const { isIgnored } = await get();
  check(isIgnored, "dist/", [
    ["dist/app.js", true],
    ["packages/web/dist/app.js", true],
    ["distance.js", false],
    ["my_dist/app.js", false],
  ]);
});
test("סיומת: עם הנקודה", async () => {
  const { isIgnored } = await get();
  check(isIgnored, "*.log", [
    ["a.log", true],
    ["catalog", false],
    ["app.log.txt", false],
  ]);
});
test("שם מדויק", async () => {
  const { isIgnored } = await get();
  check(isIgnored, ".DS_Store", [
    [".DS_Store", true],
    ["src/.DS_Store", true],
    ["src/x.DS_Store", false],
  ]);
});
test("הערות, שורות ריקות ורווחים בקצוות", async () => {
  const { isIgnored } = await get();
  check(isIgnored, "  *.tmp  \n\n# secret.txt\n   \n", [
    ["a.tmp", true],
    ["secret.txt", false],
    ["# secret.txt", false],
  ]);
  check(isIgnored, "", [["anything.js", false]]);
});
