import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { pipelineResult } = await load(import.meta.url, "P26.3-E94.ts");
const POST = ["cleanup", "success", "always", "failure", "unstable", "unsuccessful"];

test("הכול עובר, ו־when שמדלג", () => {
  assert.deepEqual(pipelineResult([{ name: "Install" }, { name: "Test" }, { name: "Push", when: false }], POST), {
    ran: ["Install", "Test"], skipped: ["Push"], result: "SUCCESS", post: ["always", "success", "cleanup"],
  });
});
test("כישלון עוצר; unstable ממשיך", () => {
  assert.deepEqual(pipelineResult([{ name: "Install" }, { name: "Test", fails: true }, { name: "Build" }, { name: "Push", when: false }], POST), {
    ran: ["Install", "Test"], skipped: ["Build", "Push"], result: "FAILURE", post: ["always", "failure", "unsuccessful", "cleanup"],
  });
  assert.deepEqual(pipelineResult([{ name: "Test", unstable: true }, { name: "Build" }, { name: "Scan", fails: true }], ["always", "unstable", "failure"]), {
    ran: ["Test", "Build", "Scan"], skipped: [], result: "FAILURE", post: ["always", "failure"],
  });
  assert.deepEqual(pipelineResult([{ name: "Test", unstable: true }, { name: "Build" }], ["success", "unstable", "unsuccessful"]), {
    ran: ["Test", "Build"], skipped: [], result: "UNSTABLE", post: ["unstable", "unsuccessful"],
  });
});
test("רק תנאים שהוגדרו; תנאי לא מוכר ← שגיאה", () => {
  assert.deepEqual(pipelineResult([], []).post, []);
  assert.throws(() => pipelineResult([], ["fixed"]));
});
