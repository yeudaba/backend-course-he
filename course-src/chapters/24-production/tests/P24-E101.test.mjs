import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E101.ts", ["createApiClient"])).createApiClient;
function fake(status, body, headers = {}) {
  const calls = [];
  const fetchFn = async (url, init) => {
    calls.push({ url, init });
    return new Response(body === undefined ? null : typeof body === "string" ? body : JSON.stringify(body), { status, headers });
  };
  return { fetchFn, calls };
}

test("headers ו־JSON", async () => {
  const create = await get();
  const { fetchFn, calls } = fake(201, { id: 1 });
  const request = create({ fetchFn, base: "http://api", getToken: () => "tok" });
  assert.deepEqual(await request("/tasks", { method: "POST", body: '{"title":"x"}', headers: { "Idempotency-Key": "k-1" } }), { id: 1 });
  assert.equal(calls[0].url, "http://api/tasks");
  assert.deepEqual(calls[0].init.headers, { "Content-Type": "application/json", Authorization: "Bearer tok", "Idempotency-Key": "k-1" });
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.body, '{"title":"x"}');
});
test("בלי body ובלי טוקן — בלי headers מיותרים; 204", async () => {
  const create = await get();
  const { fetchFn, calls } = fake(204);
  const request = create({ fetchFn, base: "http://api", getToken: () => null });
  assert.equal(await request("/tasks/1", { method: "DELETE" }), undefined);
  assert.deepEqual(calls[0].init.headers, {});
});
test("4xx — ההודעה מהשרת, בלי קוד לתמיכה", async () => {
  const create = await get();
  const { fetchFn } = fake(422, { error: { code: "DUE_DATE_IN_PAST", message: "תאריך היעד עבר" } }, { "X-Request-Id": "r-9" });
  const request = create({ fetchFn, base: "", getToken: () => "t" });
  await assert.rejects(request("/tasks"), { message: "תאריך היעד עבר" });
});
test("5xx — עם קוד לתמיכה; גוף שאינו JSON", async () => {
  const create = await get();
  const a = fake(500, { error: { code: "INTERNAL", message: "שגיאה פנימית" } }, { "X-Request-Id": "support-77" });
  await assert.rejects(create({ fetchFn: a.fetchFn, base: "", getToken: () => null })("/x"), { message: "שגיאה פנימית · קוד לתמיכה: support-77" });
  const b = fake(502, "<html>Bad Gateway</html>", { "X-Request-Id": "r-1" });
  await assert.rejects(create({ fetchFn: b.fetchFn, base: "", getToken: () => null })("/x"), { message: "HTTP 502 · קוד לתמיכה: r-1" });
  const c = fake(404, "not json");
  await assert.rejects(create({ fetchFn: c.fetchFn, base: "", getToken: () => null })("/x"), { message: "HTTP 404" });
});
