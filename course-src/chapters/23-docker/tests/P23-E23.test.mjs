import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { buildImage, composeProject, copyToTemp, docker, parseDockerfile, randomPort, readText, requireDocker, runContainer, tail, waitForHttp } from "../../tools/docker.mjs";

test("נגיש מבחוץ על 3000", { timeout: 300000 }, async (t) => {
  requireDocker();
  const { tag } = buildImage(t, path.dirname(target(import.meta.url, "P23-E23/Dockerfile")));
  const c = runContainer(t, tag, { port: 3000 });
  const res = await waitForHttp(`${c.url}/health`, { timeoutMs: 15000 }).catch((e) => {
    throw new Error(`${e.message}\nמה השרת כתב: ${c.logs()}`);
  });
  assert.equal((await res.json()).ok, true);
});
