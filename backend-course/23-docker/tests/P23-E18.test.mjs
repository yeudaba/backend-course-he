import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { buildImage, composeProject, copyToTemp, docker, parseDockerfile, randomPort, readText, requireDocker, runContainer, tail, waitForHttp } from "../../tools/docker.mjs";

test("משתנים: חובה וברירת מחדל", () => {
  requireDocker();
  const dir = path.dirname(target(import.meta.url, "P23-E18/compose.yaml"));
  const config = (env) => docker(["compose", "config", "--format", "json"], { cwd: dir, env: { API_KEY: "", LOG_LEVEL: "", ...env } });
  const missing = config({ API_KEY: undefined });
  assert.ok(!missing.ok, "בלי API_KEY — docker compose צריך להיכשל");
  assert.match(missing.output, /API_KEY/, "וההודעה מזכירה את API_KEY");
  const ok = config({ API_KEY: "abc123", LOG_LEVEL: undefined });
  assert.ok(ok.ok, ok.output);
  const env = JSON.parse(ok.stdout).services.app.environment;
  assert.equal(env.API_KEY, "abc123");
  assert.equal(env.LOG_LEVEL, "info", "ברירת מחדל: info");
  assert.equal(env.APP_NAME, "tasks");
  assert.equal(JSON.parse(config({ API_KEY: "x", LOG_LEVEL: "debug" }).stdout).services.app.environment.LOG_LEVEL, "debug");
});
