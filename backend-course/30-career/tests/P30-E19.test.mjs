import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { checkSubmission } = await load(import.meta.url, "P30-E19.ts");
const good = {
  "README.md": "# Shop\n\n```bash\nnpm install\nnpm test\n```",
  "package.json": JSON.stringify({ scripts: { start: "node dist/main.js", test: "jest" } }),
  "src/app.ts": "const port = process.env.PORT ?? 3000;",
  "src/app.spec.ts": "test('x', () => {})",
  ".env.example": "PORT=3000",
};

test("הגשה תקינה — בלי בעיות", () => assert.deepEqual(checkSubmission(good), []));
test("כל בעיה בנפרד", () => {
  const without = (k) => Object.fromEntries(Object.entries(good).filter(([p]) => p !== k));
  assert.match(checkSubmission(without("README.md")).join(), /README/);
  assert.match(checkSubmission({ ...good, "README.md": "# Shop\nA shop." }).join(), /הוראות הרצה/);
  assert.match(checkSubmission(without("src/app.spec.ts")).join(), /בדיקות/);
  assert.match(checkSubmission({ ...good, "node_modules/x/index.js": "" }).join(), /node_modules/);
  assert.match(checkSubmission({ ...good, ".env": "PORT=1" }).join(), /\.env/);
  assert.match(checkSubmission(without(".env.example")).join(), /env\.example/);
  assert.match(checkSubmission({ ...good, "package.json": "{}" }).join(), /test/);
  assert.match(checkSubmission({ ...good, "package.json": "{bad" }).join(), /package\.json/);
});
test("בדיקות בתיקיית test/ גם נחשבות", () => {
  const { ["src/app.spec.ts"]: _, ...rest } = good;
  assert.deepEqual(checkSubmission({ ...rest, "test/app.e2e.ts": "" }), []);
});
