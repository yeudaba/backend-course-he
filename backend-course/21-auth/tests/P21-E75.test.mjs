import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P21-E75.ts";
const get = () => exportsOf(import.meta.url, FILE, ["decide", "statusOf"]);
const dana = { id: 1, role: "user" };
const yossi = { id: 2, role: "user" };
const admin = { id: 3, role: "admin" };
const t5 = { id: 5, ownerId: 1, archived: false };
const old = { id: 6, ownerId: 1, archived: true };

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("טבלת החלטות", async () => {
  const { decide } = await get();
  const cases = [
    [null, "read", t5, "UNAUTHORIZED"],
    [null, "list-all", undefined, "UNAUTHORIZED"],
    [dana, "list-all", undefined, "FORBIDDEN"],
    [admin, "list-all", undefined, "OK"],
    [dana, "read", t5, "OK"],
    [dana, "update", t5, "OK"],
    [dana, "delete", t5, "OK"],
    [yossi, "read", t5, "NOT_FOUND"],
    [yossi, "update", t5, "NOT_FOUND"],
    [yossi, "delete", t5, "NOT_FOUND"],
    [dana, "read", undefined, "NOT_FOUND"],
    [admin, "read", undefined, "NOT_FOUND"],
    [admin, "read", t5, "OK"],
    [admin, "delete", t5, "OK"],
    [admin, "update", t5, "OK"],
    [dana, "update", old, "FORBIDDEN"],
    [dana, "read", old, "OK"],
    [dana, "delete", old, "OK"],
    [admin, "update", old, "FORBIDDEN"],
    [yossi, "update", old, "NOT_FOUND"],
  ];
  for (const [user, action, task, expected] of cases) {
    assert.equal(decide(user, action, task), expected, `decide(${user ? `user ${user.id} (${user.role})` : "null"}, "${action}", ${task ? `משימה ${task.id}${task.archived ? " בארכיון" : ""} של ${task.ownerId}` : "undefined"})`);
  }
});
test("statusOf", async () => {
  const { statusOf } = await get();
  assert.deepEqual(["OK", "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND"].map(statusOf), [200, 401, 403, 404]);
});
