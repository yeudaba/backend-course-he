import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { buildImage, composeProject, copyToTemp, docker, parseDockerfile, randomPort, readText, requireDocker, runContainer, tail, waitForHttp } from "../../tools/docker.mjs";

const dir = () => path.dirname(target(import.meta.url, "P23-E12/Dockerfile"));

test("Dockerfile — מבנה", () => {
  const steps = parseDockerfile(readText(path.join(dir(), "Dockerfile")));
  assert.equal(steps[0]?.cmd, "FROM");
  assert.match(steps[0].args, /^node:24-alpine$/, "FROM node:24-alpine — גרסה קבועה, לא latest");
  assert.ok(steps.some((s) => s.cmd === "WORKDIR" && s.args === "/app"), "WORKDIR /app");
  assert.ok(steps.some((s) => s.cmd === "EXPOSE" && s.args === "3000"), "EXPOSE 3000");
  const cmd = steps.filter((s) => s.cmd === "CMD").at(-1);
  assert.ok(cmd && cmd.args.startsWith("["), "CMD בצורת מערך (exec): [\"node\", \"server.mjs\"]");
});
test("נבנה ורץ", { timeout: 300000 }, async (t) => {
  requireDocker();
  const { tag } = buildImage(t, dir());
  const c = runContainer(t, tag);
  const res = await waitForHttp(`${c.url}/health`);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.match(body.node, /^v24\./, "Node 24 בתוך הקונטיינר");
});
