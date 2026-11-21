// @unit 15w
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { load, listen, target } from "../../tools/load.mjs";
import { parseHtml, qs, fakeDocument, fire, usedInnerHTML } from "../../15w-web-bridge/tests/_html.mjs";

// יחידה 15.5: CORS — רק הדף שלנו רשאי לקרוא ל־API מהדפדפן. ובסוף הקובץ: הדף עצמו (web/)
const { createApp } = await load(import.meta.url, "tasks-api/src/app.ts", { step: "שלב 2", exports: "createApp" });

async function start(t, options) {
  const { base, close } = await listen(createApp(options));
  t.after(close);
  return (method, origin, headers = {}) => fetch(base + "/tasks", { method, headers: { Origin: origin, ...headers }, signal: AbortSignal.timeout(3000) });
}

test("preflight מהדף (localhost:5500)", async (t) => {
  const send = await start(t);
  const res = await send("OPTIONS", "http://localhost:5500", { "Access-Control-Request-Method": "PATCH", "Access-Control-Request-Headers": "content-type" });
  assert.ok(res.status === 204 || res.status === 200, `preflight צריך להצליח, קיבלנו ${res.status}`);
  assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:5500");
  assert.match(res.headers.get("access-control-allow-methods") ?? "", /PATCH/);
  assert.match(res.headers.get("access-control-allow-methods") ?? "", /DELETE/);
  assert.match((res.headers.get("access-control-allow-headers") ?? "").toLowerCase(), /content-type/);
});
test("GET מהדף מקבל את ה־header", async (t) => {
  const send = await start(t);
  const res = await send("GET", "http://localhost:5500");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:5500");
});
test("אתר זר — בלי header", async (t) => {
  const send = await start(t);
  const res = await send("GET", "https://evil.example");
  assert.equal(res.headers.get("access-control-allow-origin"), null);
  assert.notEqual(res.headers.get("access-control-allow-origin"), "*");
});
test("corsOrigins מוזרק", async (t) => {
  const send = await start(t, { corsOrigins: ["https://tasks.example.com"] });
  assert.equal((await send("GET", "https://tasks.example.com")).headers.get("access-control-allow-origin"), "https://tasks.example.com");
  assert.equal((await send("GET", "http://localhost:5500")).headers.get("access-control-allow-origin"), null);
});

// ---------- הדף: web/index.html ו־web/app.js ----------
function webFile(name) {
  const p = target(import.meta.url, `tasks-api/web/${name}`);
  if (!fs.existsSync(p)) assert.fail(`לא נמצא web/${name} בתיקיית הפרויקט — צור אותו לפי יחידה 15.5, שיעור 4, סעיף 3`);
  return fs.readFileSync(p, "utf8");
}
const TASKS = [
  { id: 1, title: "ללמוד CORS", status: "todo", priority: "high", dueDate: "2026-12-01" },
  { id: 2, title: "<b>בדיקה</b>", status: "done", priority: "low", dueDate: null },
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let copies = 0;

// מריץ את web/app.js מול document מזויף (מתוך web/index.html) ו־fetch מדומה.
// respond({ url, method, body }) ← { status, body }
async function startPage(respond = () => ({ status: 200, body: { data: TASKS, meta: { page: 1, limit: 50, total: 2, totalPages: 1 } } })) {
  const doc = fakeDocument(webFile("index.html"));
  const form = doc.querySelector("form#new-task");
  if (form) form.reset = () => { for (const el of form.querySelectorAll("input")) el.value = ""; };
  const calls = [];
  globalThis.document = doc;
  // FormData מזויף: קורא את השדות לפי name מהטופס המזויף
  globalThis.FormData = class {
    constructor(f) { this.form = f; }
    get(name) { return this.form.querySelector(`[name="${name}"]`)?.value ?? null; }
  };
  globalThis.fetch = async (url, options = {}) => {
    const call = { url: String(url), method: (options.method ?? "GET").toUpperCase(), body: options.body ? JSON.parse(options.body) : undefined };
    calls.push(call);
    const r = await respond(call);
    return { ok: r.status >= 200 && r.status < 300, status: r.status, json: async () => r.body };
  };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pr2-web-"));
  const copy = path.join(dir, `app-${++copies}.mjs`);
  fs.writeFileSync(copy, webFile("app.js"));
  try {
    await import(pathToFileURL(copy).href);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  await sleep(50);
  return { doc, calls, $: (sel) => doc.querySelector(sel) };
}

test("web/index.html: הטופס, הסינון והרשימה", () => {
  const d = parseHtml(webFile("index.html"));
  const form = qs(d, "form#new-task");
  assert.ok(form, '<form id="new-task"> — טופס ההוספה');
  const title = qs(form, '[name="title"]');
  assert.ok(title, 'בטופס: שדה name="title"');
  assert.ok("required" in title.attrs, "שדה הכותרת חובה (required)");
  const priority = qs(form, 'select[name="priority"]');
  assert.ok(priority, 'בטופס: <select name="priority">');
  for (const v of ["low", "medium", "high"]) assert.ok(qs(priority, `option[value="${v}"]`), `ב־priority: <option value="${v}">`);
  assert.equal(qs(form, '[name="dueDate"]')?.attrs.type, "date", 'בטופס: <input name="dueDate" type="date">');
  assert.ok(qs(d, "select#status-filter"), '<select id="status-filter"> — סינון לפי סטטוס');
  assert.equal(qs(d, "#tasks")?.tag, "ul", '<ul id="tasks"> — הרשימה');
  const s = qs(d, "script[src]");
  assert.equal(s?.attrs.src, "app.js", '<script type="module" src="app.js">');
});
test("app.js: בטעינה — GET /tasks, ושורה לכל משימה כטקסט", async () => {
  const { $, calls, doc } = await startPage();
  const get = calls.find((c) => c.method === "GET" && new URL(c.url).pathname === "/tasks");
  assert.ok(get, `בטעינה צריך לשלוח GET ל־/tasks (נשלחו: ${calls.map((c) => c.method + " " + c.url).join(", ") || "כלום"})`);
  assert.equal(new URL(get.url).origin, "http://localhost:3000", "הדף קורא ל־API בכתובת http://localhost:3000");
  const items = $("#tasks").querySelectorAll("li");
  assert.equal(items.length, 2, "li אחד לכל משימה ב־#tasks");
  assert.ok(items[0].textContent.includes("ללמוד CORS"), "הכותרת של המשימה מופיעה בשורה");
  assert.ok(items[1].textContent.includes("<b>בדיקה</b>"), "כותרת עם תגיות מוצגת כטקסט");
  assert.equal(usedInnerHTML(doc), false, "בלי innerHTML עם נתונים מהשרת — createElement ו־textContent");
});
test("app.js: סינון לפי סטטוס", async () => {
  const { $, calls } = await startPage();
  const filter = $("#status-filter");
  filter.value = "done";
  await fire(filter, "change");
  await sleep(50);
  const last = calls.filter((c) => c.method === "GET").at(-1);
  assert.equal(new URL(last.url).searchParams.get("status"), "done", `שינוי #status-filter ל־done ← GET /tasks עם ?status=done (הבקשה האחרונה: ${last.url})`);
});
test("app.js: הוספה — POST /tasks, בלי לרענן את הדף", async () => {
  const { $, calls } = await startPage((c) => (c.method === "POST" ? { status: 201, body: { id: 3, ...c.body } } : { status: 200, body: { data: TASKS, meta: {} } }));
  $('#new-task [name="title"]').value = "משימה חדשה";
  $('#new-task [name="priority"]').value = "high";
  $('#new-task [name="dueDate"]').value = "";
  const before = calls.length;
  const event = await fire($("#new-task"), "submit");
  await sleep(50);
  assert.equal(event.defaultPrevented, true, "ב־submit צריך event.preventDefault() — אחרת הדפדפן שולח את הטופס בעצמו ומרענן את הדף");
  const post = calls.slice(before).find((c) => c.method === "POST");
  assert.ok(post, "submit ← POST /tasks");
  assert.equal(new URL(post.url).pathname, "/tasks", "POST ל־/tasks");
  assert.deepEqual(post.body, { title: "משימה חדשה", priority: "high", dueDate: null }, "הגוף: title, priority, ו־dueDate ריק ← null");
  assert.ok(calls.slice(before).some((c) => c.method === "GET"), "אחרי הוספה — רענון הרשימה (GET /tasks)");
});
test("app.js: שגיאה מה־API מוצגת בדף", async () => {
  const { $, doc } = await startPage((c) =>
    c.method === "POST"
      ? { status: 400, body: { error: { code: "VALIDATION_ERROR", message: "קלט לא תקין", details: [{ path: "title", message: "עד 120 תווים" }] } } }
      : { status: 200, body: { data: [], meta: {} } },
  );
  $('#new-task [name="title"]').value = "x".repeat(200);
  await fire($("#new-task"), "submit");
  await sleep(50);
  const text = doc.body.textContent;
  assert.ok(text.includes("קלט לא תקין"), "שגיאה מה־API (400) — ההודעה צריכה להופיע בדף");
  assert.ok(text.includes("עד 120 תווים"), "גם ה־details של השגיאה מופיעים בדף");
});
