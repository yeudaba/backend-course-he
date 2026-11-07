import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { buildImage, composeProject, copyToTemp, docker, parseDockerfile, randomPort, readText, requireDocker, runContainer, tail, waitForHttp } from "../../tools/docker.mjs";

test("Dockerfile — שלוש התקלות", () => {
  const steps = parseDockerfile(readText(target(import.meta.url, "P23-E20/Dockerfile")));
  const at = (re) => steps.findIndex((s) => re.test(`${s.cmd} ${s.args}`));
  const copyPkg = at(/^COPY .*package(-lock)?\.json/);
  const install = at(/^RUN .*npm (ci|install)/);
  const copyCode = at(/^COPY (\.|server\.mjs)\s/);
  assert.ok(copyPkg !== -1 && copyPkg < install && install < copyCode, "COPY package*.json ← npm ci ← הקוד");
  const user = steps.filter((s) => s.cmd === "USER").at(-1);
  assert.ok(user && !/^(root|0)$/.test(user.args), "USER שאינו root");
  assert.ok(!steps.some((s) => ["ENV", "ARG"].includes(s.cmd) && /(SECRET|PASSWORD|TOKEN|KEY)/i.test(s.args)), "בלי סודות ב־ENV/ARG — הם נשארים ב־image לתמיד");
});
test("נבנה ורץ, עם הסוד מבחוץ", { timeout: 300000 }, async (t) => {
  requireDocker();
  const { tag } = buildImage(t, path.dirname(target(import.meta.url, "P23-E20/Dockerfile")));
  assert.doesNotMatch(docker(["image", "inspect", "--format", "{{json .Config.Env}}", tag]).stdout, /SECRET/i, "אין JWT_SECRET בהגדרות ה־image");
  const c = runContainer(t, tag, { env: { JWT_SECRET: "from-outside" } });
  assert.equal((await (await waitForHttp(`${c.url}/health`)).json()).ok, true);
});
