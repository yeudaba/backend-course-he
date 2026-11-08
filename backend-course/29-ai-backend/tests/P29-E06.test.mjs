import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { ask } = await load(import.meta.url, "P29-E06.ts");

test("הבקשה: מודל, max_tokens, system, הודעת user — ובלי temperature", async () => {
  const { client, bodies } = fakeClaude(() => message("שלום!"));
  assert.deepEqual(await ask(client, "מה שעות המשלוח?", { system: "אתה עוזר של חנות קפה" }), { ok: true, text: "שלום!" });
  const b = bodies()[0];
  assert.equal(b.model, "claude-opus-5-5");
  assert.ok(b.max_tokens >= 1024, "max_tokens לא נמוך מדי — תשובה חתוכה עולה ניסיון חוזר");
  assert.equal(b.system, "אתה עוזר של חנות קפה");
  assert.deepEqual(b.messages, [{ role: "user", content: "מה שעות המשלוח?" }]);
  assert.equal(b.temperature, undefined, "בגרסת ה־API של 2026-10-21, temperature מחזיר 400");
});
test("רק בלוקים של טקסט, גם כשהראשון הוא thinking", async () => {
  const { client } = fakeClaude(() => message([thinking(), "חלק א. ", "חלק ב."]));
  assert.deepEqual(await ask(client, "?"), { ok: true, text: "חלק א. חלק ב." });
});
test("בלי system — לא שולחים שדה system", async () => {
  const { client, bodies } = fakeClaude(() => message("x"));
  await ask(client, "?");
  assert.equal("system" in bodies()[0], false);
});
test("סירוב, חיתוך, ריק", async () => {
  for (const [reply, reason] of [[message("", { stop_reason: "refusal" }), "refusal"], [message("חצי תשו", { stop_reason: "max_tokens" }), "max_tokens"], [message([thinking()]), "empty"]]) {
    const { client } = fakeClaude(() => reply);
    assert.deepEqual(await ask(client, "?"), { ok: false, reason });
  }
});
