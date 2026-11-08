import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { replyText } = await load(import.meta.url, "P29-E20.ts");

test("thinking ראשון — הטקסט עדיין מגיע", () => {
  assert.equal(replyText(message([thinking(), "תשובה"])), "תשובה");
});
test("כמה בלוקים, ו־tool_use באמצע — בלי undefined", () => {
  assert.equal(replyText(message(["א", toolUse("x", {}), "ב"])), "אב");
});
test("סירוב ← שגיאה", () => {
  assert.throws(() => replyText(message("", { stop_reason: "refusal" })), /סירב/);
});
test("תשובה חתוכה ← שגיאה", () => {
  assert.throws(() => replyText(message("חצי", { stop_reason: "max_tokens" })), /max_tokens/);
});
