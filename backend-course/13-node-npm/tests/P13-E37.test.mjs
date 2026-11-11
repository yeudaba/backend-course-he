import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E37.mjs", ["lockSummary"])).lockSummary;
const lock = {
  packages: {
    "": { name: "app" },
    "node_modules/express": { version: "5.1.0" },
    "node_modules/debug": { version: "4.4.1" },
    "node_modules/send/node_modules/debug": { version: "2.6.9" },
    "node_modules/@types/node": { version: "24.3.0", dev: true },
    "node_modules/eslint": { version: "9.39.0", dev: true },
    "node_modules/eslint/node_modules/@types/node": { version: "20.1.0", dev: true },
    "node_modules/body-parser/node_modules/debug": { version: "2.6.9" },
    "node_modules/ms": { version: "2.1.3" },
  },
};

test("ספירות", async () => {
  const s = (await get())(lock);
  assert.equal(s.total, 8, "בלי הרשומה \"\"");
  assert.equal(s.dev, 3);
  assert.equal(s.prod, 5);
});
test("versions — Map עם גרסאות ממוינות בלי כפילויות, כולל scope", async () => {
  const s = (await get())(lock);
  assert.ok(s.versions instanceof Map, "versions צריך להיות Map");
  assert.deepEqual(s.versions.get("debug"), ["2.6.9", "4.4.1"]);
  assert.deepEqual(s.versions.get("@types/node"), ["20.1.0", "24.3.0"], "השם אחרי node_modules/ האחרון — כולל scope");
  assert.deepEqual(s.versions.get("ms"), ["2.1.3"]);
  assert.equal(s.versions.size, 5);
});
test("duplicates", async () => {
  const s = (await get())(lock);
  assert.deepEqual(s.duplicates, ["@types/node", "debug"]);
});
test("lock בלי packages", async () => {
  const s = (await get())({ lockfileVersion: 3 });
  assert.equal(s.total, 0);
  assert.deepEqual(s.duplicates, []);
  assert.equal(s.versions.size, 0);
});
