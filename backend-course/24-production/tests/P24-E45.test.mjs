import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P24-E45.ts", ["safeUrl"]);

test("ברירת המחדל", async () => {
  const { safeUrl } = await get();
  assert.equal(safeUrl("/reset-password?token=8f3kQ1x&lang=he"), "/reset-password?token=***&lang=he");
  assert.equal(safeUrl("/login?Password=hunter2"), "/login?Password=***", "בלי תלות באותיות");
  assert.equal(safeUrl("/cb?state=s1&code=xyz&KEY=1&secret=2"), "/cb?state=s1&code=***&KEY=***&secret=***");
  assert.equal(safeUrl("/x?mytoken=1&token2=2"), "/x?mytoken=1&token2=2", "רק שם מלא — לא חלק משם");
});
test("בלי query, fragment וקידוד", async () => {
  const { safeUrl } = await get();
  assert.equal(safeUrl("/health"), "/health");
  assert.equal(safeUrl("/health?"), "/health");
  assert.equal(safeUrl("/tasks?page=2#top"), "/tasks?page=2");
  assert.equal(safeUrl("/search?q=a b&token=x y"), "/search?q=a+b&token=***");
  assert.equal(safeUrl("/a?token=1&token=2&p=3"), "/a?token=***&p=3", "פרמטר שמופיע פעמיים");
});
test("רשימה משלך", async () => {
  const { safeUrl } = await get();
  assert.equal(safeUrl("/tasks?page=2&API_KEY=abc", ["api_key"]), "/tasks?page=2&API_KEY=***");
  assert.equal(safeUrl("/tasks?token=abc", ["api_key"]), "/tasks?token=abc", "הרשימה מחליפה את ברירת המחדל");
});
