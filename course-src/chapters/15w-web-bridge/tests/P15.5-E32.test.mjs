import { test } from "node:test";
import assert from "node:assert/strict";
import { listen } from "../../tools/load.mjs";
import { exportsOf } from "./_src.mjs";
import { parseHtml, qs, qsa, cleanText } from "./_html.mjs";

async function start(t, products) {
  const { createApp } = await exportsOf(import.meta.url, "P15.5-E32.mjs", ["createApp"]);
  const { base, close } = await listen(createApp(products));
  t.after(close);
  return (accept) => fetch(base + "/products", { headers: accept ? { Accept: accept } : {} });
}
const products = [{ id: 1, name: "מקלדת <RGB>", price: 249 }, { id: 2, name: "עכבר & כבל", price: 89.5 }];
test("HTML", async (t) => {
  const get = await start(t, products);
  const res = await get("text/html,application/xhtml+xml,*/*;q=0.8");
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type") ?? "", /^text\/html/);
  const d = parseHtml(await res.text());
  assert.ok(d.doctype, "<!doctype html>");
  assert.equal(qs(d, "html")?.attrs.lang, "he");
  assert.equal(qs(d, "html")?.attrs.dir, "rtl");
  assert.equal(cleanText(qs(d, "title") ?? { children: [] }), "מוצרים");
  assert.equal(cleanText(qs(d, "h1") ?? { children: [] }), "מוצרים");
  assert.deepEqual(qsa(d, "ul li").map(cleanText), ["מקלדת <RGB> — ₪249.00", "עכבר & כבל — ₪89.50"], "שם — ₪מחיר, והשמות מקודדים (המפענח מחזיר את הטקסט)");
  assert.equal(qsa(d, "li b, li rgb").length, 0);
});
test("שמות מקודדים ב־HTML עצמו", async (t) => {
  const get = await start(t, [{ id: 1, name: "<script>alert(1)</script>", price: 1 }]);
  const text = await (await get("text/html")).text();
  assert.ok(!text.includes("<script>"), "התגית לא מופיעה כמו שהיא");
  assert.ok(text.includes("&lt;script&gt;"), "קודד ל־&lt;script&gt;");
});
test("רשימה ריקה", async (t) => {
  const get = await start(t, []);
  const d = parseHtml(await (await get("text/html")).text());
  assert.equal(qsa(d, "ul").length, 0, "בלי ul");
  assert.equal(cleanText(qs(d, "p") ?? { children: [] }), "אין מוצרים");
});
test("JSON", async (t) => {
  const get = await start(t, products);
  for (const accept of [undefined, "application/json", "*/*"]) {
    const res = await get(accept);
    assert.match(res.headers.get("content-type") ?? "", /^application\/json/, `Accept: ${accept}`);
    assert.deepEqual(await res.json(), products);
  }
});
