import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E68.mjs", ["tasksPath"])).tasksPath;
test("tasksPath", async () => {
  const f = await get();
  assert.equal(f({ status: "open", q: " חלב ", page: 1 }), "/tasks?status=open&q=%D7%97%D7%9C%D7%91");
  assert.equal(f({ status: "all", q: "   " }), "/tasks");
  assert.equal(f({ q: "red shoes", page: 3 }), "/tasks?q=red+shoes&page=3");
  assert.equal(f(), "/tasks");
  assert.equal(f({}), "/tasks");
  assert.equal(f({ status: "", page: 0 }), "/tasks");
  assert.equal(f({ page: 2, status: "done" }), "/tasks?status=done&page=2", "הסדר: status, q, page");
  assert.equal(f({ q: "a&b=c" }), "/tasks?q=a%26b%3Dc");
});
