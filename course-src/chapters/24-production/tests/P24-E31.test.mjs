import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P24-E31.ts";
const get = () => exportsOf(import.meta.url, FILE, ["routeOf", "routeReport"]);
const req = (method, path, status, ms) => JSON.stringify({ level: "info", msg: "request", method, path, status, ms });

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("routeOf — נרמול נתיב", async () => {
  const { routeOf } = await get();
  assert.equal(routeOf("get", "/tasks/17/comments?x=1"), "GET /tasks/:id/comments");
  assert.equal(routeOf("GET", "/tasks/17"), "GET /tasks/:id");
  assert.equal(routeOf("DELETE", "/users/5/tasks/9"), "DELETE /users/:id/tasks/:id");
  assert.equal(routeOf("GET", "/v2/users"), "GET /v2/users", "רק קטע שכולו ספרות הופך ל־:id");
  assert.equal(routeOf("GET", "/tasks/123abc"), "GET /tasks/123abc");
  assert.equal(routeOf("GET", "/health"), "GET /health");
});
test("routeReport — ספירה, אחוז שגיאות, p95 ומיון", async () => {
  const { routeReport } = await get();
  const lines = [];
  for (let i = 1; i <= 20; i++) lines.push(req("GET", `/tasks/${i}`, i === 3 ? 503 : 200, i * 10));
  lines.push(req("post", "/tasks", 201, 100), req("POST", "/tasks", 500, 900), req("POST", "/tasks?dry=1", 400, 50));
  lines.push(req("GET", "/a", 200, 100), req("GET", "/b", 200, 100));
  const { routes, skipped } = routeReport(lines);
  assert.equal(skipped, 0);
  assert.deepEqual(routes, [
    { route: "POST /tasks", count: 3, errorPct: 33.3, p95: 900 },
    { route: "GET /tasks/:id", count: 20, errorPct: 5, p95: 190 },
    { route: "GET /a", count: 1, errorPct: 0, p95: 100 },
    { route: "GET /b", count: 1, errorPct: 0, p95: 100 },
  ], "p95 של 10..200 (20 ערכים) הוא האיבר ה־19 = 190. 400 היא לא שגיאת שרת. בתיקו — לפי route");
});
test("מיון מספרי, לא כטקסט", async () => {
  const { routeReport } = await get();
  const lines = [100, 9, 12, 8, 7].map((ms) => req("GET", "/x", 200, ms));
  assert.equal(routeReport(lines).routes[0].p95, 100, "sort() בלי פונקציה ממיין 100 לפני 9");
});
test("שורות שאינן בקשה ← skipped", async () => {
  const { routeReport } = await get();
  const lines = [
    "Error: connect ECONNREFUSED 127.0.0.1:5432",
    '{"level":"info","msg":"server started","port":3000}',
    '{"msg":"request","method":"GET","path":"/x","status":200}',
    '{"msg":"request","method":"GET","path":"/x","status":200,"ms":"12"}',
    "null",
    "",
    req("GET", "/x", 200, 5),
  ];
  const r = routeReport(lines);
  assert.equal(r.skipped, 6, "טקסט, msg אחר, ms חסר, ms כטקסט, null, שורה ריקה");
  assert.deepEqual(r.routes, [{ route: "GET /x", count: 1, errorPct: 0, p95: 5 }]);
  assert.deepEqual(routeReport([]), { routes: [], skipped: 0 });
});
