import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message } from "./_claude.mjs";

const { processTicket } = await load(import.meta.url, "P29-E58.ts");

function deps(respond) {
  const f = fakeClaude(respond);
  const log = [];
  return { f, log, d: { client: f.client, markNeedsHuman: async (id, r) => log.push(["human", id, r]), saveCategory: async (id, c) => log.push(["save", id, c]) } };
}
const job = (attemptsMade = 0, attempts = 3) => ({ data: { ticketId: "T1", text: "איפה החבילה?" }, attemptsMade, opts: { attempts } });

test("מסווג ושומר", async () => {
  const s = deps(() => message('{"category":"order_status"}'));
  assert.deepEqual(await processTicket(job(), s.d), { status: "classified" });
  assert.deepEqual(s.log, [["save", "T1", "order_status"]]);
  assert.equal(s.f.bodies()[0].output_config.format.type, "json_schema");
});
test("המודל נכשל ← לבן אדם, בלי לזרוק", async () => {
  const s = deps(() => message('{"category":"spam"}'));
  assert.deepEqual(await processTicket(job(), s.d), { status: "needs_human" });
  assert.deepEqual(s.log, [["human", "T1", "model_failed"]]);
});
test("429/5xx ← זורק; בניסיון האחרון גם מסמן", async () => {
  let s = deps(() => ({ error: 529 }));
  await assert.rejects(processTicket(job(0, 3), s.d), (e) => e.status === 529);
  assert.deepEqual(s.log, []);
  s = deps(() => ({ error: 429 }));
  await assert.rejects(processTicket(job(2, 3), s.d), (e) => e.status === 429);
  assert.deepEqual(s.log, [["human", "T1", "api_unavailable"]]);
});
test("4xx אחר ← לבן אדם, בלי לזרוק", async () => {
  const s = deps(() => ({ error: 400 }));
  assert.deepEqual(await processTicket(job(), s.d), { status: "needs_human" });
  assert.deepEqual(s.log, [["human", "T1", "api_error"]]);
});
