import { test } from "node:test";
import assert from "node:assert/strict";
import { target } from "../../tools/load.mjs";
import { readText } from "../../tools/docker.mjs";

// הכללים של .dockerignore (כמו P23-E64): תבנית מכסה גם את מה שבתוך תיקייה, ‏! — לא להתעלם, האחרונה קובעת
function toRegExp(p) {
  let re = "";
  for (let i = 0; i < p.length; i++) {
    const c = p[i];
    if (c === "*" && p[i + 1] === "*") { if (p[i + 2] === "/") { re += "(?:.*/)?"; i += 2; } else { re += ".*"; i++; } }
    else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${re}(?:/.*)?$`);
}
function ignored(file, lines) {
  let r = false;
  for (const raw of lines) {
    let p = raw.trim();
    if (!p || p.startsWith("#")) continue;
    const neg = p.startsWith("!");
    if (neg) p = p.slice(1);
    p = p.replace(/^\/+|\/+$/g, "");
    if (toRegExp(p).test(file)) r = !neg;
  }
  return r;
}

test(".dockerignore", () => {
  const lines = readText(target(import.meta.url, "P23-E88/.dockerignore")).split(/\r?\n/);
  const out = ["node_modules/@nestjs/core/index.js", "dist/main.js", "coverage/lcov.info", "src/generated/prisma/client.ts", ".git/HEAD", ".env", ".env.local", ".env.production", "debug.log", "npm-debug.log"];
  const inn = [".env.example", "src/main.ts", "src/tasks/tasks.service.ts", "prisma/schema.prisma", "prisma/migrations/20261101090000_init/migration.sql", "package.json", "package-lock.json", "tsconfig.json", "nest-cli.json", "Dockerfile"];
  for (const f of out) assert.equal(ignored(f, lines), true, `${f} — לא אמור להיכנס ל־image`);
  for (const f of inn) assert.equal(ignored(f, lines), false, `${f} — צריך להיכנס ל־image`);
});
