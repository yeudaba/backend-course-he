import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseClientMessage } = await load(import.meta.url, "P26-E119.ts");

test("הודעות תקינות — גם מ־Buffer", () => {
  assert.deepEqual(parseClientMessage('{"type":"join","room":"orders-7"}'), { ok: true, msg: { type: "join", room: "orders-7" } });
  assert.deepEqual(parseClientMessage(Buffer.from('{"type":"say","text":"  שלום  "}')), { ok: true, msg: { type: "say", text: "שלום" } });
  assert.deepEqual(parseClientMessage('{"type":"typing"}'), { ok: true, msg: { type: "typing" } });
  assert.equal(parseClientMessage(JSON.stringify({ type: "say", text: "x".repeat(500) })).ok, true);
});
test("JSON שבור", () => {
  assert.deepEqual(parseClientMessage("{type: join"), { ok: false, error: "JSON לא תקין" });
  assert.deepEqual(parseClientMessage(Buffer.from("")), { ok: false, error: "JSON לא תקין" });
});
test("לא תקין ← ok: false עם הודעה", () => {
  const bad = [
    { type: "join", room: "Orders" },
    { type: "join", room: "" },
    { type: "join", room: "a".repeat(31) },
    { type: "say", text: "   " },
    { type: "say", text: "x".repeat(501) },
    { type: "say", text: "hi", from: "admin" },
    { type: "typing", room: "x" },
    { type: "kick", user: 3 },
    { text: "no type" },
    null,
    [1, 2],
  ];
  for (const b of bad) {
    const r = parseClientMessage(JSON.stringify(b));
    assert.equal(r.ok, false, JSON.stringify(b));
    assert.equal(typeof r.error, "string");
    assert.ok(r.error.length > 0);
  }
});
