import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse } from "./_claude.mjs";

const { runDurable } = await load(import.meta.url, "P29.5-E14.ts");
const def = (name) => ({ name, description: name, input_schema: { type: "object", properties: {} } });
const memoryKV = (failAfter = Infinity) => {
  const m = new Map();
  let sets = 0;
  return {
    m,
    get: async (k) => m.get(k),
    set: async (k, v) => {
      if (++sets > failAfter) throw new Error("CRASH");
      m.set(k, v);
    },
  };
};
// תסריט: צעד 1 ← email, צעד 2 ← charge + invoice, צעד 3 ← סיום
const script = (b, i) =>
  [
    message([toolUse("email", {}, "e1")], { stop_reason: "tool_use" }),
    message([toolUse("charge", {}, "c1"), toolUse("invoice", {}, "i1")], { stop_reason: "tool_use" }),
    message("נשלח, חויב, וחשבונית הופקה"),
  ][i];

function tools(effects) {
  const t = (name) => ({ definition: def(name), run: async () => (effects.push(name), `${name} ok`) });
  return { email: t("email"), charge: t("charge"), invoice: t("invoice") };
}

test("ריצה רגילה ← אותה תוצאה, והמצב נשמר", async () => {
  const effects = [];
  const store = memoryKV();
  const { client } = fakeClaude(script);
  assert.equal(await runDurable(client, { runId: "r1", store, system: "s", tools: tools(effects), prompt: "go" }), "נשלח, חויב, וחשבונית הופקה");
  assert.deepEqual(effects, ["email", "charge", "invoice"]);
  assert.ok(store.m.has("agent-run:r1"));
  const again = fakeClaude(() => assert.fail("ריצה שהסתיימה לא קוראת שוב למודל"));
  assert.equal(await runDurable(again.client, { runId: "r1", store, system: "s", tools: tools(effects), prompt: "go" }), "נשלח, חויב, וחשבונית הופקה");
});
test("קריסה בקריאה למודל ← בהמשך: בלי לחזור על צעדים, ובלי לשלוח מייל פעמיים", async () => {
  const effects = [];
  const store = memoryKV();
  const crashing = fakeClaude((b, i) => (i < 2 ? script(b, i) : { error: 500 }));
  await assert.rejects(runDurable(crashing.client, { runId: "r2", store, system: "s", tools: tools(effects), prompt: "go" }));
  assert.deepEqual(effects, ["email", "charge", "invoice"]);
  const resumed = fakeClaude((b) => {
    assert.equal(b.messages.length, 5, "ההיסטוריה נטענה מהמצב השמור");
    return script(b, 2);
  });
  assert.equal(await runDurable(resumed.client, { runId: "r2", store, system: "s", tools: tools(effects), prompt: "go" }), "נשלח, חויב, וחשבונית הופקה");
  assert.equal(resumed.requests.length, 1);
  assert.deepEqual(effects, ["email", "charge", "invoice"], "אף כלי לא רץ פעמיים");
});
test("קריסה באמצע הכלים ← מה שכבר רץ לא רץ שוב", async () => {
  const effects = [];
  // שמירות: אחרי assistant(1), email, user(1), assistant(2), charge ← כאן נופלים לפני invoice
  const store = memoryKV(5);
  const { client } = fakeClaude(script);
  await assert.rejects(runDurable(client, { runId: "r3", store, system: "s", tools: tools(effects), prompt: "go" }), /CRASH/);
  const stored = JSON.parse(store.m.get("agent-run:r3"));
  assert.ok(stored, "יש מצב שמור");
  const healthy = { m: store.m, get: async (k) => store.m.get(k), set: async (k, v) => void store.m.set(k, v) };
  const rest = fakeClaude((b) => script(b, 2));
  await runDurable(rest.client, { runId: "r3", store: healthy, system: "s", tools: tools(effects), prompt: "go" });
  assert.equal(effects.filter((x) => x === "email").length, 1);
  assert.equal(effects.filter((x) => x === "charge").length, 1, "charge רץ ונשמר לפני הקריסה — לא רץ שוב");
  // invoice רץ, והשמירה שלו היא זו שנפלה — אז הוא רץ שוב. at-least-once: לכן לכלים עם תופעות לוואי
  // שולחים idempotency key (למשל ה־tool_use id) לשירות החיצוני
  assert.equal(effects.filter((x) => x === "invoice").length, 2);
});
