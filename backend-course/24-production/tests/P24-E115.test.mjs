import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P24-E115.ts", ["parseMetrics", "total"]);
const TEXT = `# HELP http_requests_total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/tasks/:id",status="200"} 2
http_requests_total{method="POST",route="/tasks",status="201"} 1

# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{route="/tasks/:id",le="0.05"} 1
http_request_duration_seconds_bucket{route="/tasks/:id",le="+Inf"} 3
http_request_duration_seconds_sum{route="/tasks/:id"} 0.382
http_request_duration_seconds_count{route="/tasks/:id"} 3
process_start_time_seconds 1.7310e9
up 1 1731000000000
`;

test("הפלט של השיעור", async () => {
  const { parseMetrics } = await get();
  const s = parseMetrics(TEXT);
  assert.equal(s.length, 8);
  assert.deepEqual(s[0], { name: "http_requests_total", labels: { method: "GET", route: "/tasks/:id", status: "200" }, value: 2 });
  assert.deepEqual(s[3], { name: "http_request_duration_seconds_bucket", labels: { route: "/tasks/:id", le: "+Inf" }, value: 3 });
  assert.equal(s[4].value, 0.382);
  assert.deepEqual(s[6], { name: "process_start_time_seconds", labels: {}, value: 1731000000 });
  assert.deepEqual(s[7], { name: "up", labels: {}, value: 1 }, "timestamp אחרי הערך — מתעלמים");
});
test("escaping, פסיקים ו־} בתוך ערכים, ערכים מיוחדים", async () => {
  const { parseMetrics } = await get();
  const s = parseMetrics(String.raw`x{path="/a,b}",q="say \"hi\"",w="c:\\dir",n="a\nb"} +Inf
y{a="1",} -Inf
z NaN
w -0.5e-3`);
  assert.deepEqual(s[0].labels, { path: "/a,b}", q: 'say "hi"', w: "c:\\dir", n: "a\nb" });
  assert.equal(s[0].value, Infinity);
  assert.deepEqual(s[1], { name: "y", labels: { a: "1" }, value: -Infinity }, "פסיק בסוף מותר");
  assert.ok(Number.isNaN(s[2].value));
  assert.equal(s[3].value, -0.0005);
});
test("שורות לא תקינות ← SyntaxError עם מספר שורה", async () => {
  const { parseMetrics } = await get();
  const bad = [
    ["ok 1\n# c\n9bad 1", 3],
    ['x{a="1"} abc', 1],
    ["\nx{a=1} 2", 2],
    ['x{a="1} 2', 1],
    ["x", 1],
    ['x{a="1" b="2"} 3', 1],
  ];
  for (const [text, line] of bad) {
    assert.throws(() => parseMetrics(text), (e) => e instanceof SyntaxError && e.message.startsWith(`שורה ${line}:`), JSON.stringify(text));
  }
  assert.deepEqual(parseMetrics(""), []);
  assert.deepEqual(parseMetrics("# only comments\n\n"), []);
});
test("total", async () => {
  const { parseMetrics, total } = await get();
  const s = parseMetrics(`r{method="GET",status="200"} 5
r{method="GET",status="500"} 2
r{method="POST",status="500"} 1
other 100`);
  assert.equal(total(s, "r"), 8);
  assert.equal(total(s, "r", { status: "500" }), 3);
  assert.equal(total(s, "r", { method: "GET", status: "500" }), 2);
  assert.equal(total(s, "r", { method: "PUT" }), 0);
  assert.equal(total(s, "missing"), 0);
});
