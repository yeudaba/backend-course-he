import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { resolveDeps } = await load(import.meta.url, "P13-E24.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

const registry = {
  express: { "5.0.0": { deps: { router: "^2.0.0", debug: "^4.0.0" } }, "5.1.0": { deps: { router: "^2.1.0", debug: "^4.3.0" } } },
  router: { "2.0.0": {}, "2.2.0": { deps: { debug: "^4.0.0" } } },
  debug: { "4.3.4": {}, "4.4.0": {}, "3.9.0": {} },
  old: { "1.0.0": { deps: { debug: "^3.0.0" } } },
};
test("פתרון", () => assert.deepEqual(resolveDeps({ express: "^5.0.0" }, registry), { debug: "4.4.0", express: "5.1.0", router: "2.2.0" }));
test("גרסה מדויקת", () => assert.deepEqual(resolveDeps({ debug: "4.3.4" }, registry), { debug: "4.3.4" }));
test("לא נמצא", () => { assert.throws(() => resolveDeps({ nope: "^1.0.0" }, registry), { message: "אין גרסה של nope שמתאימה ל־^1.0.0" }); assert.throws(() => resolveDeps({ express: "^9.0.0" }, registry), { message: "אין גרסה של express שמתאימה ל־^9.0.0" }); });
test("התנגשות", () => assert.throws(() => resolveDeps({ express: "^5.0.0", old: "^1.0.0" }, registry), { message: "התנגשות: debug" }));
