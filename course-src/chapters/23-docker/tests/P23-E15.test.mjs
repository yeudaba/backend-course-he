import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { buildImage, composeProject, copyToTemp, docker, parseDockerfile, randomPort, readText, requireDocker, runContainer, tail, waitForHttp } from "../../tools/docker.mjs";

test("multi-stage: ב־image הסופי אין TypeScript ואין קוד מקור", { timeout: 400000 }, async (t) => {
  requireDocker();
  const dir = path.dirname(target(import.meta.url, "P23-E15/Dockerfile"));
  const froms = parseDockerfile(readText(path.join(dir, "Dockerfile"))).filter((s) => s.cmd === "FROM");
  assert.ok(froms.length >= 2, "שני שלבים (שני FROM)");
  const { tag } = buildImage(t, dir);
  const ls = (p) => docker(["run", "--rm", tag, "ls", p]).ok;
  assert.ok(ls("/app/dist/server.js"), "dist/server.js קיים");
  assert.ok(!ls("/app/src"), "src/ לא צריך להיות ב־image הסופי");
  assert.ok(!ls("/app/node_modules/typescript"), "typescript (devDependency) לא צריך להיות ב־image הסופי");
  assert.notEqual(docker(["run", "--rm", tag, "id", "-u"]).stdout.trim(), "0", "לא root");
  const c = runContainer(t, tag);
  assert.equal((await (await waitForHttp(`${c.url}/health`)).json()).ok, true);
});
