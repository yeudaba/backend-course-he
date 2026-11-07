import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { buildImage, composeProject, copyToTemp, docker, parseDockerfile, randomPort, readText, requireDocker, runContainer, tail, waitForHttp } from "../../tools/docker.mjs";

test("שינוי בקוד לא מריץ שוב את npm ci", { timeout: 400000 }, async (t) => {
  requireDocker();
  const ctx = copyToTemp(t, path.dirname(target(import.meta.url, "P23-E14/Dockerfile")));
  const tag = `p23-e14-${process.pid}`;
  buildImage(t, ctx, { tag });
  fs.appendFileSync(path.join(ctx, "server.mjs"), "\n// שינוי קטן בקוד\n");
  const { output } = buildImage(t, ctx, { tag, plain: true });
  const step = /#(\d+) \[[^\]]*\] RUN [^\n]*npm (ci|install)[^\n]*\n#\1 CACHED/.test(output);
  assert.ok(step, `אחרי שינוי ב־server.mjs, השלב של npm ci היה צריך להיות CACHED.\n${tail(output, 25)}`);
  const c = runContainer(t, tag);
  await waitForHttp(`${c.url}/health`);
  assert.deepEqual(await (await fetch(`${c.url}/age?value=30`)).json(), { age: 30 }, "zod עובד בתוך הקונטיינר");
  assert.notEqual(docker(["run", "--rm", tag, "id", "-u"]).stdout.trim(), "0", "לא root");
});
