import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readStarter, parseHtml, qs, fakeDocument, fire, usedInnerHTML } from "./_html.mjs";

const PRODUCTS = [
  { id: 1, name: "קפה טורקי", price: 32 },
  { id: 2, name: "<b>פולי</b> אספרסו", price: 48 },
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let n = 0;

// מריץ את app.js מול document מזויף ו־fetch מדומה. respond(url) ← { status, body } או זורק
async function startPage(respond) {
  const html = readStarter(import.meta.url, "P15.5-E10-shop/index.html");
  const doc = fakeDocument(html);
  const calls = [];
  globalThis.document = doc;
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    const r = await respond(String(url));
    return { ok: r.status >= 200 && r.status < 300, status: r.status, json: async () => r.body };
  };
  // עותק חדש של app.js לכל בדיקה (כ־.mjs), כדי שהקוד ירוץ מחדש מול ה־document החדש
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p15-e10-"));
  const copy = path.join(dir, `app-${++n}.mjs`);
  fs.writeFileSync(copy, readStarter(import.meta.url, "P15.5-E10-shop/app.js"));
  try {
    await import(pathToFileURL(copy).href);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  await sleep(400); // חיפוש ראשון (גם עם debounce)
  return { doc, calls, $: (s) => doc.querySelector(s) };
}
const ok = (body) => ({ status: 200, body });

test("index.html: השדות ו־app.js כמודול", () => {
  const d = parseHtml(readStarter(import.meta.url, "P15.5-E10-shop/index.html"));
  assert.equal(qs(d, "input#q")?.tag, "input", "input#q");
  assert.ok(qs(d, "#status"), "#status");
  assert.equal(qs(d, "#results")?.tag, "ul", "ul#results");
  const s = qs(d, "script[src]");
  assert.equal(s?.attrs.src, "app.js", '<script type="module" src="app.js">');
  assert.equal(s.attrs.type, "module", '<script type="module" src="app.js">');
});
test("בטעינה: כל המוצרים, שם ומחיר, כטקסט", async () => {
  const { $, calls, doc } = await startPage(() => ok(PRODUCTS));
  assert.ok(calls.length >= 1, "בטעינה צריך לשלוח חיפוש ראשון");
  assert.match(calls[0], /\/products\?q=$/, "חיפוש ריק: /products?q=");
  const items = $("#results").querySelectorAll("li");
  assert.equal(items.length, 2, "li לכל מוצר");
  assert.ok(items[1].textContent.includes("<b>פולי</b> אספרסו"), "שם המוצר כטקסט");
  assert.ok(items[1].textContent.includes("48"), "המחיר");
  assert.equal(usedInnerHTML(doc), false, "בלי innerHTML — שם מוצר הוא טקסט");
});
test("הקלדה: q מקודד בכתובת, והתוצאות מתחלפות", async () => {
  const { $, calls } = await startPage((url) => ok(url.includes("q=%D7%A7%D7%A4%D7%94") ? [PRODUCTS[0]] : PRODUCTS));
  const input = $("#q");
  input.value = "קפה";
  await fire(input, "input");
  await sleep(450);
  assert.ok(calls.some((u) => u.endsWith("/products?q=" + encodeURIComponent("קפה"))), "חיפוש עם q=<הטקסט, מקודד ב־encodeURIComponent>");
  assert.equal($("#results").querySelectorAll("li").length, 1, "הרשימה מוחלפת בתוצאות החדשות, לא מתווספת");
});
test("'טוען...' בזמן הבקשה, 'לא נמצאו מוצרים' כשאין", async () => {
  let release;
  const { $ } = await startPage((url) => (url.endsWith("q=") ? ok(PRODUCTS) : new Promise((r) => (release = () => r(ok([]))))));
  const input = $("#q");
  input.value = "תה";
  await fire(input, "input");
  await sleep(400);
  assert.ok(release, "החיפוש לא נשלח אחרי הקלדה");
  assert.equal($("#status").textContent.trim(), "טוען...", "בזמן הבקשה: טוען...");
  release();
  await sleep(20);
  assert.equal($("#status").textContent.trim(), "לא נמצאו מוצרים");
  assert.equal($("#results").querySelectorAll("li").length, 0);
});
test("API לא זמין ← הודעת שגיאה", async () => {
  const { $ } = await startPage(() => {
    throw new TypeError("Failed to fetch");
  });
  const status = $("#status").textContent.trim();
  assert.ok(status && status !== "טוען..." && status !== "לא נמצאו מוצרים", `כשה־API לא זמין צריך להציג הודעת שגיאה (קיבלנו: "${status}")`);
  assert.equal($("#results").querySelectorAll("li").length, 0);
});
test("שגיאת HTTP (500) ← הודעת שגיאה, לא רשימה", async () => {
  const { $ } = await startPage(() => ({ status: 500, body: { error: { message: "boom" } } }));
  const status = $("#status").textContent.trim();
  assert.ok(status && status !== "טוען..." && status !== "לא נמצאו מוצרים", "תשובה שאינה ok היא שגיאה — בדוק res.ok");
});
