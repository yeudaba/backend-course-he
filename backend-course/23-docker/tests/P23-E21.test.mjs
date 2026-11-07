import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { buildImage, composeProject, copyToTemp, docker, parseDockerfile, randomPort, readText, requireDocker, runContainer, tail, waitForHttp } from "../../tools/docker.mjs";

test("compose — שלוש התקלות", { timeout: 600000 }, async (t) => {
  requireDocker();
  const port = randomPort();
  const p = composeProject(t, path.dirname(target(import.meta.url, "P23-E21/compose.yaml")), { APP_PORT: String(port) });
  const up = p.run(["up", "-d", "--build", "--wait"]);
  assert.ok(up.ok, `docker compose up נכשל. מה ה־app כתב:\n${tail(p.run(["logs", "--no-color", "app"]).output, 15)}\n${tail(up.output, 10)}`);
  await waitForHttp(`http://localhost:${port}/health`);
  const visit = async () => (await (await fetch(`http://localhost:${port}/visits`)).json()).visits;
  assert.equal(await visit(), 1);
  assert.ok(p.run(["down"]).ok);
  const again = p.run(["up", "-d", "--wait"]);
  assert.ok(again.ok, `up שני נכשל:\n${tail(p.run(["logs", "--no-color", "db"]).output, 15)}`);
  await waitForHttp(`http://localhost:${port}/health`);
  assert.equal(await visit(), 2, "הנתונים נשמרו בין down ל־up");
});
