import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P23-E95.ts", ["syncEnv"])).syncEnv;
const EXAMPLE = "# הגדרות\nDATABASE_URL=postgresql://tasks:tasks@localhost:5432/tasks\nJWT_SECRET=\nBCRYPT_ROUNDS=12\nCORS_ORIGINS=http://localhost:5500\nSENTRY_DSN=change-me\n";

test("משלים חסרים, לא נוגע בקיים", async () => {
  const sync = await get();
  const current = "# שלי\nJWT_SECRET=my-own-secret-that-is-long-enough-123\nBCRYPT_ROUNDS=10\n";
  assert.deepEqual(sync(EXAMPLE, current), {
    text: current + "# נוסף מ־.env.example\nDATABASE_URL=postgresql://tasks:tasks@localhost:5432/tasks\nCORS_ORIGINS=http://localhost:5500\nSENTRY_DSN=change-me\n",
    added: ["DATABASE_URL", "CORS_ORIGINS", "SENTRY_DSN"],
    placeholders: ["SENTRY_DSN"],
  });
});
test("כבר מלא / ריק / בלי שורה אחרונה", async () => {
  const sync = await get();
  const full = "DATABASE_URL=x\nJWT_SECRET=\nBCRYPT_ROUNDS=4\nCORS_ORIGINS=y\nSENTRY_DSN=z\n";
  assert.deepEqual(sync(EXAMPLE, full), { text: full, added: [], placeholders: ["JWT_SECRET"] });
  const fromEmpty = sync(EXAMPLE, "");
  assert.equal(fromEmpty.text, "# נוסף מ־.env.example\nDATABASE_URL=postgresql://tasks:tasks@localhost:5432/tasks\nJWT_SECRET=\nBCRYPT_ROUNDS=12\nCORS_ORIGINS=http://localhost:5500\nSENTRY_DSN=change-me\n");
  assert.deepEqual(fromEmpty.placeholders, ["JWT_SECRET", "SENTRY_DSN"]);
  const r = sync("A=1\nB=2\n", "A=9");
  assert.equal(r.text, "A=9\n# נוסף מ־.env.example\nB=2\n", "מוסיף \\n לפני ההשלמה");
  assert.equal(sync("A=1\n", "A=a=b").text, "A=a=b\n");
});
