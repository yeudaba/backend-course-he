import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen } from "../../tools/load.mjs";

const { renderComments, postComment } = await load(import.meta.url, "P15.5-E11.mjs");

test("renderComments", () => {
  assert.equal(renderComments([{ author: "דנה", text: "שלום" }]), "<ul><li><b>דנה</b>: שלום</li></ul>");
  const html = renderComments([{ author: '<img src=x onerror="alert(1)">', text: "<script>steal()</script>" }, { text: "בלי מחבר" }]);
  assert.ok(!html.includes("<script>") && !html.includes("<img"), "אסור שתגיות מהמשתמש יגיעו כ־HTML");
  assert.equal(html, '<ul><li><b>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</b>: &lt;script&gt;steal()&lt;/script&gt;</li><li><b>אנונימי</b>: בלי מחבר</li></ul>');
  assert.equal(renderComments([]), "<ul></ul>");
});
test("postComment", async (t) => {
  const app = express();
  app.post("/comments", express.json(), (req, res) => {
    if (!req.is("application/json")) return res.status(415).json({ error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "צריך JSON" } });
    if (!req.body.text) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "תגובה ריקה" } });
    res.status(201).json({ id: 1, text: req.body.text });
  });
  const { base, close } = await listen(app);
  t.after(close);
  assert.deepEqual(await postComment(base, "יפה מאוד"), { id: 1, text: "יפה מאוד" });
  await assert.rejects(postComment(base, ""), { message: "תגובה ריקה" });
});
