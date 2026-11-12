import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E93.ts", ["AuthSession"])).AuthSession;

async function server(t) {
  const state = { log: [], valid: new Set(["R-start"]), n: 0, down: false };
  const s = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const data = body ? JSON.parse(body) : {};
      state.log.push(`${req.method} ${req.url} ${body}`);
      const json = (st, d) => res.writeHead(st, { "content-type": "application/json" }).end(JSON.stringify(d));
      if (state.down) return res.destroy();
      if (req.url === "/auth/login") {
        if (data.password !== "dana-password-1") return json(401, { code: "INVALID_CREDENTIALS", message: "אימייל או סיסמה שגויים" });
        const n = ++state.n;
        state.valid.add(`R${n}`);
        return json(200, { accessToken: `A${n}`, refreshToken: `R${n}`, tokenType: "Bearer", expiresIn: 900 });
      }
      if (req.url === "/auth/refresh") {
        if (!state.valid.delete(data.refreshToken)) return json(401, { code: "INVALID_REFRESH_TOKEN", message: "צריך להתחבר מחדש" });
        const n = ++state.n;
        state.valid.add(`R${n}`);
        return json(200, { accessToken: `A${n}`, refreshToken: `R${n}`, tokenType: "Bearer", expiresIn: 900 });
      }
      if (req.url === "/auth/logout") { state.valid.delete(data.refreshToken); return res.writeHead(204).end(); }
      json(404, {});
    });
  });
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  t.after(() => { s.closeAllConnections?.(); s.close(); });
  return { base: `http://127.0.0.1:${s.address().port}`, state };
}
const storage = (init = {}) => {
  const m = new Map(Object.entries(init));
  return { map: m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, String(v)), removeItem: (k) => void m.delete(k) };
};

test("login", async (t) => {
  const AuthSession = await get();
  const { base, state } = await server(t);
  const st = storage();
  const s = new AuthSession(base, st);
  assert.equal(s.accessToken, null);
  await assert.rejects(s.login("dana@example.com", "wrong"), { message: "אימייל או סיסמה שגויים" });
  assert.equal(s.accessToken, null);
  await s.login("dana@example.com", "dana-password-1");
  assert.equal(s.accessToken, "A1");
  assert.deepEqual([...st.map], [["refreshToken", "R1"]], "ב־storage רק ה־refresh token, במפתח refreshToken");
  assert.deepEqual(JSON.parse(state.log.at(-1).split(" ").slice(2).join(" ")), { email: "dana@example.com", password: "dana-password-1" });
});
test("restore — רענון דף", async (t) => {
  const AuthSession = await get();
  const { base, state } = await server(t);
  const empty = new AuthSession(base, storage());
  assert.equal(await empty.restore(), false);
  assert.equal(state.log.length, 0, "אין refresh token ← בלי בקשה");
  const st = storage({ refreshToken: "R-start" });
  const s = new AuthSession(base, st);
  assert.equal(await s.restore(), true);
  assert.equal(s.accessToken, "A1");
  assert.equal(st.getItem("refreshToken"), "R1", "ה־refresh token החדש נשמר (rotation)");
  const again = new AuthSession(base, storage({ refreshToken: "R-start" }));
  const st2 = storage({ refreshToken: "R-start" });
  const s2 = new AuthSession(base, st2);
  assert.equal(await s2.restore(), false, "טוקן שכבר נוצל");
  assert.equal(st2.getItem("refreshToken"), null, "נמחק מה־storage");
  assert.equal(s2.accessToken, null);
  void again;
});
test("logout", async (t) => {
  const AuthSession = await get();
  const { base, state } = await server(t);
  const st = storage();
  const s = new AuthSession(base, st);
  await s.login("dana@example.com", "dana-password-1");
  await s.logout();
  assert.equal(s.accessToken, null);
  assert.equal(st.getItem("refreshToken"), null);
  assert.ok(state.log.some((l) => l.startsWith("POST /auth/logout") && l.includes('"refreshToken":"R1"')), "POST /auth/logout עם ה־refresh token");
  assert.equal(state.valid.has("R1"), false);
  await s.login("dana@example.com", "dana-password-1");
  state.down = true;
  await s.logout();
  assert.equal(s.accessToken, null, "גם כשהשרת לא עונה — יוצאים");
  assert.equal(st.getItem("refreshToken"), null);
});
