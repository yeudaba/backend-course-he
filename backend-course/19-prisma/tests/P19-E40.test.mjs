import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { target } from "../../tools/load.mjs";

const IGNORED = ["node_modules/express/index.js", ".env", "src/generated/prisma/client.ts", "dist/main.js"];
const KEPT = ["prisma/migrations/20261104200437_init/migration.sql", "prisma/schema.prisma", ".env.example", "src/db.ts", "prisma.config.ts", "package.json"];

test("P19-E40: מה Git מתעלם ממנו", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gitignore-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.copyFileSync(target(import.meta.url, "P19-E40.gitignore"), path.join(dir, ".gitignore"));
  spawnSync("git", ["init", "-q"], { cwd: dir });
  const ignored = (p) => spawnSync("git", ["check-ignore", "-q", "--no-index", p], { cwd: dir }).status === 0;
  for (const p of IGNORED) assert.ok(ignored(p), `${p} צריך להיות ב־.gitignore`);
  for (const p of KEPT) assert.ok(!ignored(p), `${p} צריך להיכנס ל־Git — אבל ה־.gitignore שלך מתעלם ממנו`);
});
