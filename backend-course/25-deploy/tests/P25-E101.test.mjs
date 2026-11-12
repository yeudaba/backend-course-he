import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E101.ts", ["configProblemsFromLogs"])).configProblemsFromLogs;

test("שורת טקסט ושורת JSON", async () => {
  const f = await get();
  const log = [
    "==> Building...",
    "==> Running 'node dist/main.js'",
    "/app/dist/server-config.js:31",
    "Error: הגדרות שרת לא תקינות — DATABASE_URL: חובה בפרודקשן; CORS_ORIGINS: בפרודקשן רק https ובלי * או נתיב: http://localhost:5500",
    "    at loadServerConfig (/app/dist/server-config.js:31:11)",
    JSON.stringify({ level: "error", msg: "bootstrap failed", err: { message: "הגדרות לא תקינות ב־.env — JWT_SECRET: לפחות 32 תווים אקראיים" } }),
    "Error: הגדרות שרת לא תקינות — DATABASE_URL: חובה בפרודקשן",
  ].join("\n");
  assert.deepEqual(f(log), [
    { name: "DATABASE_URL", message: "חובה בפרודקשן" },
    { name: "CORS_ORIGINS", message: "בפרודקשן רק https ובלי * או נתיב: http://localhost:5500" },
    { name: "JWT_SECRET", message: "לפחות 32 תווים אקראיים" },
  ]);
});
test("msg של JSON, ובלי תקלה", async () => {
  const f = await get();
  assert.deepEqual(f(JSON.stringify({ msg: "הגדרות שרת לא תקינות — TRUST_PROXY: Too big: expected number to be <=5" })), [{ name: "TRUST_PROXY", message: "Too big: expected number to be <=5" }]);
  assert.deepEqual(f('{"level":"info","msg":"server started","port":10000}\nnull\n[1]\n'), []);
  assert.deepEqual(f(""), []);
});
