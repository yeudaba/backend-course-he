import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { buildImage, composeProject, copyToTemp, docker, parseDockerfile, randomPort, readText, requireDocker, runContainer, tail, waitForHttp } from "../../tools/docker.mjs";

test("מה שלא נכנס ל־image", { timeout: 300000 }, async (t) => {
  requireDocker();
  const src = path.dirname(target(import.meta.url, "P23-E13/Dockerfile"));
  assert.ok(fs.existsSync(path.join(src, ".dockerignore")), "צריך קובץ .dockerignore");
  // מוסיפים לעותק את מה שיש בתיקייה אמיתית
  const ctx = copyToTemp(t, src);
  const add = (rel, content) => {
    fs.mkdirSync(path.dirname(path.join(ctx, rel)), { recursive: true });
    fs.writeFileSync(path.join(ctx, rel), content);
  };
  add(".env", "JWT_SECRET=super-secret\n");
  add(".env.production", "JWT_SECRET=prod-secret\n");
  add("node_modules/left-pad/index.js", "module.exports = 1;\n");
  add("coverage/index.html", "<html></html>\n");
  add("logs/app.log", "log\n");
  add("debug.log", "log\n");
  add("tmp/cache.bin", "x\n");
  const { tag } = buildImage(t, ctx);
  const files = docker(["run", "--rm", tag, "find", "/app", "-mindepth", "1"]).stdout.split("\n").map((l) => l.replace("/app/", "")).filter(Boolean);
  for (const must of ["server.mjs", "package.json"]) assert.ok(files.includes(must), `חסר ${must} ב־image`);
  for (const bad of [".env", ".env.production", "node_modules", "coverage", "logs", "debug.log", "tmp"]) {
    assert.ok(!files.some((f) => f === bad || f.startsWith(bad + "/")), `${bad} נכנס ל־image`);
  }
});
