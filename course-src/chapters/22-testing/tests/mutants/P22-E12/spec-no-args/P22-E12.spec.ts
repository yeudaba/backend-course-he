import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { debounce } from "./P22-E12.ts";
test("once after wait", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const fn = mock.fn(); const save = debounce(fn, 300);
  save("a"); t.mock.timers.tick(200); save("ab"); t.mock.timers.tick(299);
  assert.equal(fn.mock.callCount(), 0); t.mock.timers.tick(1); assert.equal(fn.mock.callCount(), 1);
});
test("cancel", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const fn = mock.fn(); const save = debounce(fn, 300); save("x"); save.cancel(); t.mock.timers.tick(1000); assert.equal(fn.mock.callCount(), 0);
});
