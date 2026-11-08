import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";
import { params, parallelRound, endless } from "./_loop.mjs";

const { runTools } = await load(import.meta.url, "P29-E13.ts");

test("סיבוב עם שני כלים במקביל ← תוצאות בהודעה אחת; מחזיר את ההודעה האחרונה", async () => {
  const out = await parallelRound(runTools);
  assert.equal(out.message.content[0].text, "לאטה 14, מוקה 16");
  assert.equal(out.toolCalls, 2);
  assert.equal(out.messages.length, 3);
});
test("כלי לא מוכר וכלי שזורק ← tool_result עם is_error, והלולאה ממשיכה", async () => {
  const { client, bodies } = fakeClaude((b, i) =>
    i === 0 ? message([toolUse("delete_everything", {}, "a"), toolUse("get_price", { item: "x" }, "b")], { stop_reason: "tool_use" }) : message("סליחה"),
  );
  await runTools(client, params, { get_price: async () => { throw new Error("db down"); } });
  const results = bodies()[1].messages[2].content;
  assert.deepEqual(results.map((r) => [r.tool_use_id, r.is_error]), [["a", true], ["b", true]]);
  assert.match(results[1].content, /db down/);
});
test("maxIterations ← שגיאה, לא לולאה אינסופית", async () => {
  const calls = await endless((c, p, h) => runTools(c, p, h, { maxIterations: 3 }));
  assert.equal(calls, 3);
});
test("בלי tool_use — מחזיר מיד", async () => {
  const { client, bodies } = fakeClaude(() => message("שלום"));
  const out = await runTools(client, params, {});
  assert.equal(out.toolCalls, 0);
  assert.equal(bodies().length, 1);
});
