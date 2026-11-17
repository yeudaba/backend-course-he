import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E69.ts", ["createAuthedFetch"])).createAuthedFetch;

// שרת: access תקין = "A<n>" כש־n הוא הדור הנוכחי. refresh: "R<n>" עובד פעם אחת ונותן A<n+1>/R<n+1>
async function server(t, { refreshWorks = true, delay = 30 } = {}) {
  const state = { gen: 1, refreshCalls: 0, log: [] };
  const s = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      state.log.push(`${req.method} ${req.url} ${req.headers.authorization ?? "-"} ${req.headers["x-extra"] ?? ""}`.trim());
      const json = (status, data) => res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(data));
      if (req.url === "/auth/refresh") {
        state.refreshCalls++;
        const { refreshToken } = JSON.parse(body || "{}");
        return setTimeout(() => {
          if (!refreshWorks || refreshToken !== `R${state.gen}`) return json(401, { code: "INVALID_REFRESH_TOKEN" });
          state.gen++;
          json(200, { accessToken: `A${state.gen}`, refreshToken: `R${state.gen}` });
        }, delay);
      }
      if (req.url === "/always401") return json(401, { code: "NOPE" });
      if (req.headers.authorization !== `Bearer A${state.gen}`) return json(401, { code: "INVALID_TOKEN" });
      json(200, { ok: req.url });
    });
  });
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  t.after(() => s.close());
  return { base: `http://127.0.0.1:${s.address().port}`, state };
}
const memStore = (tokens) => {
  const sets = [];
  return { sets, get: () => tokens, set: (t) => { sets.push(t); tokens = t; } };
};

test("טוקן תקין — בלי refresh, headers נשמרים", async (t) => {
  const createAuthedFetch = await get();
  const { base, state } = await server(t);
  const store = memStore({ accessToken: "A1", refreshToken: "R1" });
  const f = createAuthedFetch(base, store);
  const res = await f("/tasks", { headers: { "x-extra": "1" } });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: "/tasks" });
  assert.deepEqual(state.log, ["GET /tasks Bearer A1 1"]);
  assert.equal(state.refreshCalls, 0);
});
test("401 ← refresh ← ניסיון חוזר", async (t) => {
  const createAuthedFetch = await get();
  const { base, state } = await server(t);
  state.gen = 1;
  const store = memStore({ accessToken: "A0", refreshToken: "R1" });
  const f = createAuthedFetch(base, store);
  const res = await f("/tasks", { headers: { "x-extra": "2" } });
  assert.equal(res.status, 200);
  assert.deepEqual(store.sets, [{ accessToken: "A2", refreshToken: "R2" }], "הזוג החדש נשמר ב־store");
  assert.deepEqual(state.log, ["GET /tasks Bearer A0 2", "POST /auth/refresh -", "GET /tasks Bearer A2 2"], "בקשה, refresh, ואותה בקשה שוב עם הטוקן החדש");
});
test("5 בקשות שמקבלות 401 יחד — refresh אחד", async (t) => {
  const createAuthedFetch = await get();
  const { base, state } = await server(t);
  const store = memStore({ accessToken: "A0", refreshToken: "R1" });
  const f = createAuthedFetch(base, store);
  const all = await Promise.all(["/a", "/b", "/c", "/d", "/e"].map((p) => f(p)));
  assert.deepEqual(all.map((r) => r.status), [200, 200, 200, 200, 200]);
  assert.equal(state.refreshCalls, 1, `נשלחו ${state.refreshCalls} בקשות refresh — צריך אחת לכולן`);
  const later = await f("/f");
  assert.equal(later.status, 200);
  assert.equal(state.refreshCalls, 1);
});
test("refresh נכשל ← store.set(null), מחזירים את ה־401", async (t) => {
  const createAuthedFetch = await get();
  const { base, state } = await server(t, { refreshWorks: false });
  const store = memStore({ accessToken: "A0", refreshToken: "R1" });
  const f = createAuthedFetch(base, store);
  const res = await f("/tasks");
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { code: "INVALID_TOKEN" }, "ה־401 של הבקשה המקורית");
  assert.deepEqual(store.sets, [null]);
  assert.equal(state.refreshCalls, 1);
});
test("ניסיון חוזר אחד בלבד, ובלי טוקנים — בלי refresh", async (t) => {
  const createAuthedFetch = await get();
  const { base, state } = await server(t);
  const store = memStore({ accessToken: "A0", refreshToken: "R1" });
  const f = createAuthedFetch(base, store);
  const res = await f("/always401");
  assert.equal(res.status, 401);
  assert.equal(state.log.filter((l) => l.startsWith("GET /always401")).length, 2, "פעם אחת, ועוד פעם אחת אחרי refresh — לא יותר");
  const anon = createAuthedFetch(base, memStore(null));
  const r2 = await anon("/tasks");
  assert.equal(r2.status, 401);
  assert.equal(state.log.at(-1), "GET /tasks -", "בלי טוקנים — בלי Authorization");
  assert.equal(state.refreshCalls, 1);
});
