import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { buildImage, composeProject, copyToTemp, docker, parseDockerfile, randomPort, readText, requireDocker, runContainer, tail, waitForHttp } from "../../tools/docker.mjs";

async function waitHealthy(id) {
  for (let i = 0; i < 60; i++) {
    const status = docker(["inspect", "--format", "{{if .State.Health}}{{.State.Health.Status}}{{end}}", id]).stdout.trim();
    if (status === "healthy") return status;
    if (status === "") return "no-healthcheck";
    await new Promise((r) => setTimeout(r, 500));
  }
  return "timeout";
}

test("HEALTHCHECK על PORT מה־env", { timeout: 300000 }, async (t) => {
  requireDocker();
  const { tag } = buildImage(t, path.dirname(target(import.meta.url, "P23-E16/Dockerfile")));
  const a = runContainer(t, tag, { port: 8080 });
  assert.equal(await waitHealthy(a.id), "healthy", "ברירת מחדל (8080) — הקונטיינר צריך להגיע ל־healthy");
  assert.equal((await (await fetch(`${a.url}/health`)).json()).ok, true);
  const b = runContainer(t, tag, { port: 9000, env: { PORT: "9000" } });
  assert.equal(await waitHealthy(b.id), "healthy", "עם PORT=9000 — ה־healthcheck צריך לבדוק את 9000");
  assert.notEqual(docker(["run", "--rm", tag, "id", "-u"]).stdout.trim(), "0", "לא root");
});
