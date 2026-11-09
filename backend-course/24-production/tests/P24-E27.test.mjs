import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createRegistry } = await load(import.meta.url, "P24-E27.ts");

test("counter: HELP, TYPE ושורה לכל צירוף labels", () => {
  const r = createRegistry();
  const c = r.counter({ name: "http_requests_total", help: "HTTP requests", labelNames: ["method", "status"] });
  c.inc({ method: "GET", status: "200" });
  c.inc({ status: "200", method: "GET" }, 2);
  c.inc({ method: "POST", status: "201" });
  assert.equal(
    r.metrics(),
    '# HELP http_requests_total HTTP requests\n# TYPE http_requests_total counter\nhttp_requests_total{method="GET",status="200"} 3\nhttp_requests_total{method="POST",status="201"} 1\n',
    "סדר ה־labels לפי labelNames, וסדר השורות לפי הפעם הראשונה"
  );
});
test("counter בלי labels", () => {
  const r = createRegistry();
  const c = r.counter({ name: "jobs_total", help: "Jobs" });
  c.inc();
  c.inc();
  assert.match(r.metrics(), /^jobs_total 2$/m);
});
test("counter רק עולה; label לא מוכר או חסר — שגיאה", () => {
  const r = createRegistry();
  const c = r.counter({ name: "a_total", help: "a", labelNames: ["x"] });
  assert.throws(() => c.inc({ x: "1" }, -1), RangeError);
  assert.throws(() => c.inc({ x: "1", y: "2" }), Error, "label לא מוכר");
  assert.throws(() => c.inc({}), Error, "label חסר");
});
test("אותו שם פעמיים — שגיאה", () => {
  const r = createRegistry();
  r.counter({ name: "dup", help: "x" });
  assert.throws(() => r.counter({ name: "dup", help: "x" }));
});
test("histogram: דליים מצטברים, +Inf, sum ו־count", () => {
  const r = createRegistry();
  const h = r.histogram({ name: "d_seconds", help: "Duration", labelNames: ["route"], buckets: [0.5, 0.1] });
  for (const v of [0.05, 0.1, 0.3, 2]) h.observe({ route: "/a" }, v);
  const lines = r.metrics().trim().split("\n");
  assert.deepEqual(lines, [
    "# HELP d_seconds Duration",
    "# TYPE d_seconds histogram",
    'd_seconds_bucket{route="/a",le="0.1"} 2',
    'd_seconds_bucket{route="/a",le="0.5"} 3',
    'd_seconds_bucket{route="/a",le="+Inf"} 4',
    'd_seconds_sum{route="/a"} 2.45',
    'd_seconds_count{route="/a"} 4',
  ], "דליים ממוינים; 0.1 נכנס ל־le=\"0.1\" (קטן או שווה)");
});
test("escaping של ערכי labels", () => {
  const r = createRegistry();
  const c = r.counter({ name: "e_total", help: "e", labelNames: ["path"] });
  c.inc({ path: 'a"b\\c\nd' });
  assert.match(r.metrics(), /^e_total\{path="a\\"b\\\\c\\nd"\} 1$/m);
});
test("כמה מדדים — לפי סדר הרישום, והטקסט מסתיים בשורה חדשה", () => {
  const r = createRegistry();
  r.counter({ name: "first_total", help: "1" }).inc();
  r.histogram({ name: "second_seconds", help: "2", buckets: [1] }).observe({}, 0.5);
  const text = r.metrics();
  assert.ok(text.endsWith("\n"));
  assert.ok(text.indexOf("first_total") < text.indexOf("second_seconds"));
  assert.match(text, /^second_seconds_bucket\{le="1"\} 1$/m);
});
