import { test } from "node:test";
import assert from "node:assert/strict";
import Anthropic from "@anthropic-ai/sdk";
import { load } from "../../tools/load.mjs";
import { message } from "./_claude.mjs";

const { scriptedFetch } = await load(import.meta.url, "P29-E90.ts");
const params = (q) => ({ model: "claude-opus-5-5", max_tokens: 100, messages: [{ role: "user", content: q }] });

test("תשובות לפי הסדר, וגופי הבקשות נשמרים", async () => {
  const s = scriptedFetch([message("ראשונה"), message("שנייה", { stop_reason: "max_tokens" })]);
  const client = new Anthropic({ apiKey: "x", maxRetries: 0, fetch: s.fetch });
  const a = await client.messages.create(params("א"));
  const b = await client.messages.create(params("ב"));
  assert.equal(a.content[0].text, "ראשונה");
  assert.equal(b.stop_reason, "max_tokens");
  assert.equal(s.bodies.length, 2);
  assert.deepEqual(s.bodies.map((x) => x.messages[0].content), ["א", "ב"]);
  assert.equal(s.bodies[0].model, "claude-opus-5-5");
});
test("שגיאות הופכות לשגיאות אמיתיות של ה־SDK", async () => {
  const s = scriptedFetch([{ error: 429 }, { error: 529, message: "busy" }, { error: 400, message: "bad field" }, message("ok")]);
  const client = new Anthropic({ apiKey: "x", maxRetries: 0, fetch: s.fetch });
  const e1 = await client.messages.create(params("1")).catch((e) => e);
  assert.ok(e1 instanceof Anthropic.RateLimitError, "429 ← RateLimitError");
  assert.match(e1.message, /scripted error/);
  const e2 = await client.messages.create(params("2")).catch((e) => e);
  assert.ok(e2 instanceof Anthropic.InternalServerError, "529 ← InternalServerError");
  assert.equal(e2.status, 529);
  assert.match(e2.message, /busy/);
  const e3 = await client.messages.create(params("3")).catch((e) => e);
  assert.ok(e3 instanceof Anthropic.BadRequestError);
  assert.equal((await client.messages.create(params("4"))).content[0].text, "ok");
});
test("נגמר התסריט ← הקריאה נכשלת", async () => {
  const s = scriptedFetch([message("one")]);
  const client = new Anthropic({ apiKey: "x", maxRetries: 0, fetch: s.fetch });
  await client.messages.create(params("1"));
  await assert.rejects(client.messages.create(params("2")));
  assert.equal(s.bodies.length, 2, "גם הקריאה העודפת נרשמה");
  const empty = scriptedFetch([]);
  await assert.rejects(new Anthropic({ apiKey: "x", maxRetries: 0, fetch: empty.fetch }).messages.create(params("x")));
});
