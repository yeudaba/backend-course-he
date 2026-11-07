import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { buildImage, composeProject, copyToTemp, docker, parseDockerfile, randomPort, readText, requireDocker, runContainer, tail, waitForHttp } from "../../tools/docker.mjs";

test("פיתוח מול פרודקשן", () => {
  requireDocker();
  const dir = path.dirname(target(import.meta.url, "P23-E19/compose.yaml"));
  assert.ok(fs.existsSync(path.join(dir, "compose.override.yaml")), "צריך compose.override.yaml");
  const dev = JSON.parse(docker(["compose", "config", "--format", "json"], { cwd: dir }).stdout).services.app;
  const prod = JSON.parse(docker(["compose", "-f", "compose.yaml", "config", "--format", "json"], { cwd: dir }).stdout).services.app;
  assert.ok((dev.volumes ?? []).some((v) => v.type === "bind" && v.target === "/app"), "בפיתוח: הקוד מהמחשב מחובר ל־/app (bind mount)");
  assert.ok(Array.isArray(dev.command) && dev.command.includes("--watch"), "בפיתוח: node --watch");
  assert.equal(dev.environment?.LOG_LEVEL, "debug");
  assert.ok(!(prod.volumes ?? []).some((v) => v.type === "bind"), "בפרודקשן (רק compose.yaml): בלי bind mount");
  assert.ok(!prod.command, "בפרודקשן: ה־CMD של ה־image");
  assert.ok((prod.ports ?? []).some((p) => p.target === 3000), "ה־port בקובץ הבסיס");
});
