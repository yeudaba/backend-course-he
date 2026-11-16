import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message } from "./_claude.mjs";

const { extractOrder } = await load(import.meta.url, "P29-E49.ts");
const CATALOG = { "V60 Dripper": 6900, "Espresso Blend 1kg": 7990, "Paper Filters x100": 2490 };

test("סכום מהקטלוג, פריטים לא מוכרים בצד", async () => {
  const reply = { items: [{ product: "v60 dripper", quantity: 2 }, { product: "Espresso Blend 1kg", quantity: 1 }, { product: "Gold Grinder", quantity: 1 }, { product: "Paper Filters x100", quantity: 50 }] };
  const { client, bodies } = fakeClaude(() => message(JSON.stringify(reply)));
  const r = await extractOrder(client, "2 V60 ושקית אספרסו, ומטחנת זהב, ו־50 פילטרים", CATALOG);
  assert.deepEqual(r, {
    ok: true,
    items: [{ product: "V60 Dripper", quantity: 2, priceCents: 6900 }, { product: "Espresso Blend 1kg", quantity: 1, priceCents: 7990 }],
    totalCents: 21790,
    skipped: [{ product: "Gold Grinder", reason: "unknown_product" }, { product: "Paper Filters x100", reason: "bad_quantity" }],
  });
  const b = bodies()[0];
  assert.equal(b.output_config?.format?.type, "json_schema", "structured outputs דרך output_config.format");
  assert.ok(String(b.system).includes("V60 Dripper") && String(b.system).includes("Paper Filters x100"), "שמות המוצרים ב־system");
});
test("המודל נכשל ← model_failed; APIError ← זורק", async () => {
  for (const reply of [message("not json"), message('{"items":[{"product":"x"}]}'), message('{"items":', { stop_reason: "max_tokens" })]) {
    const { client } = fakeClaude(() => reply);
    assert.deepEqual(await extractOrder(client, "?", CATALOG), { ok: false, reason: "model_failed" });
  }
  const { client } = fakeClaude(() => ({ error: 500 }));
  await assert.rejects(extractOrder(client, "?", CATALOG), (e) => e.status === 500);
});
test("ריק", async () => {
  const { client } = fakeClaude(() => message('{"items":[]}'));
  assert.deepEqual(await extractOrder(client, "שלום", CATALOG), { ok: true, items: [], totalCents: 0, skipped: [] });
});
