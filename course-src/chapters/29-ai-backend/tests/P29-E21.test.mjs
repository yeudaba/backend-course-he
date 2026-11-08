import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";
import { params, parallelRound, endless } from "./_loop.mjs";

const { runTools } = await load(import.meta.url, "P29-E21.ts");

test("שני כלים ← assistant נשלח, ותוצאות בהודעת user אחת", async () => {
  const out = await parallelRound(runTools);
  assert.equal(out.content[0].text, "לאטה 14, מוקה 16");
});
test("יש תקרה לסיבובים", async () => {
  assert.equal(await endless((c, p, h) => runTools(c, p, h, 4)), 4);
});
