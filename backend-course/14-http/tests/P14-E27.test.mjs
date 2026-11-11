import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P14-E27.mjs";
const get = async () => (await exportsOf(import.meta.url, FILE, ["RequestStats"])).RequestStats;

test("מחלקה ריקה", async () => {
  const RequestStats = await get();
  const s = new RequestStats();
  assert.equal(s.total, 0, "total הוא getter (get total()) שמחזיר מספר");
  assert.deepEqual(s.summary(), []);
});
test("ספירה, ממוצע ושגיאות", async () => {
  const RequestStats = await get();
  const s = new RequestStats();
  s.record("GET", "/users", 200, 12);
  s.record("GET", "/users", 200, 20);
  s.record("POST", "/users", 201, 35);
  s.record("GET", "/orders", 500, 101);
  s.record("GET", "/users", 503, 3);
  s.record("GET", "/users", 404, 5);
  assert.equal(s.total, 6);
  assert.deepEqual(s.summary(), [
    { route: "GET /users", count: 4, avgMs: 10, errors: 1 },
    { route: "GET /orders", count: 1, avgMs: 101, errors: 1 },
    { route: "POST /users", count: 1, avgMs: 35, errors: 0 },
  ], "avgMs = Math.round(סכום / כמות). errors = status 500 ומעלה בלבד (404 לא נחשב)");
});
test("מיון: count יורד, ובתיקו — route לפי א״ב", async () => {
  const RequestStats = await get();
  const s = new RequestStats();
  for (const [m, p] of [["GET", "/b"], ["GET", "/a"], ["GET", "/c"], ["GET", "/c"], ["DELETE", "/x"]]) s.record(m, p, 200, 1);
  assert.deepEqual(s.summary().map((r) => r.route), ["GET /c", "DELETE /x", "GET /a", "GET /b"]);
});
test("ממוצע מעוגל", async () => {
  const RequestStats = await get();
  const s = new RequestStats();
  s.record("GET", "/", 200, 1);
  s.record("GET", "/", 200, 2);
  assert.equal(s.summary()[0].avgMs, 2, "1.5 מעוגל ל־2 (Math.round)");
});
test("שני מופעים נפרדים, והנתונים פרטיים", async () => {
  const RequestStats = await get();
  const a = new RequestStats();
  const b = new RequestStats();
  a.record("GET", "/", 200, 1);
  assert.equal(b.total, 0, "המונה של b הושפע מ־a");
  assert.deepEqual(Object.keys(a), [], `יש שדות ציבוריים (${Object.keys(a).join(", ")}) — השתמש בשדה פרטי עם #`);
  a.summary()[0].count = 999;
  assert.equal(a.summary()[0].count, 1, "שינוי במערך ש־summary() החזירה שינה את הנתונים בפנים — צור אובייקטים חדשים");
});
test("כתוב כמחלקה עם Map", () => {
  const src = code(import.meta.url, FILE);
  assert.match(src, /\bclass\s+RequestStats\b/, "התרגיל מתרגל class (פרק 12)");
  assert.match(src, /new\s+Map\s*\(/, "התרגיל מתרגל Map (פרק 7)");
});
