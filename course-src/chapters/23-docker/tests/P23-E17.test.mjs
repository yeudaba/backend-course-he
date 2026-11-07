import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { buildImage, composeProject, copyToTemp, docker, parseDockerfile, randomPort, readText, requireDocker, runContainer, tail, waitForHttp } from "../../tools/docker.mjs";

test("app + PostgreSQL, והנתונים נשמרים", { timeout: 600000 }, async (t) => {
  requireDocker();
  const port = randomPort();
  const p = composeProject(t, path.dirname(target(import.meta.url, "P23-E17/compose.yaml")), { APP_PORT: String(port) });
  const cfg = p.config();
  const db = cfg.services?.db;
  assert.ok(db && /^postgres:18/.test(db.image), "שירות db עם postgres:18-alpine");
  assert.ok(db.healthcheck, "healthcheck ל־db");
  assert.ok((db.volumes ?? []).some((v) => v.type === "volume" && v.target === "/var/lib/postgresql"), "volume בשם ל־/var/lib/postgresql");
  assert.equal(cfg.services.app?.depends_on?.db?.condition, "service_healthy", "app תלוי ב־db עם service_healthy");
  const up = p.run(["up", "-d", "--build", "--wait"]);
  assert.ok(up.ok, `up נכשל:\n${tail(up.output)}\n${tail(p.run(["logs", "--no-color"]).output)}`);
  const visit = async () => (await (await fetch(`http://localhost:${port}/visits`)).json()).visits;
  await waitForHttp(`http://localhost:${port}/health`);
  assert.equal(await visit(), 1);
  assert.equal(await visit(), 2);
  assert.ok(p.run(["down"]).ok);
  assert.ok(p.run(["up", "-d", "--wait"]).ok);
  await waitForHttp(`http://localhost:${port}/health`);
  assert.equal(await visit(), 3, "אחרי down ו־up — הספירה ממשיכה (volume)");
});
