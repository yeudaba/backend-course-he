import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("סינון, מיון ו־limit", async (t) => {
  const { EventsModule } = exportsOf(import.meta.url, "P20-E51.ts", ["EventsModule", "EventsQuery", "EventsController"]);
  const { call } = await nestApp(t, EventsModule, { validation: true });
  const ids = async (qs) => {
    const r = await call("GET", "/events" + qs);
    assert.equal(r.status, 200, `${qs}: ${JSON.stringify(r.body)}`);
    return r.body.map((e) => e.id);
  };
  assert.deepEqual(await ids(""), [2, 1, 4, 3, 5], "לפי תאריך");
  assert.deepEqual(await ids("?city=haifa"), [2, 5]);
  assert.deepEqual(await ids("?from=2026-12-01&to=2026-12-31"), [1, 4], "כולל הקצוות");
  assert.deepEqual(await ids("?from=2027-01-01"), [3, 5]);
  assert.deepEqual(await ids("?to=2026-11-20"), [2]);
  assert.deepEqual(await ids("?limit=2"), [2, 1], "limit מגיע כמחרוזת");
  assert.deepEqual(await ids("?city=tel-aviv&limit=1"), [1]);
  const bad = await call("GET", "/events?from=2027-01-01&to=2026-01-01");
  assert.equal(bad.status, 400);
  assert.equal(bad.body?.message, "from חייב להיות לפני to");
  for (const qs of ["?city=eilat", "?from=yesterday", "?limit=0", "?limit=21", "?limit=abc", "?limit=2.5"]) {
    assert.equal((await call("GET", "/events" + qs)).status, 400, qs);
  }
});
