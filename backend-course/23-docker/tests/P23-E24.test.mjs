import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { buildImage, composeProject, copyToTemp, docker, parseDockerfile, randomPort, readText, requireDocker, runContainer, tail, waitForHttp } from "../../tools/docker.mjs";

test("nginx מגיש את הדף ומעביר את /api ל־app", { timeout: 600000 }, async (t) => {
  requireDocker();
  const port = randomPort();
  const p = composeProject(t, path.dirname(target(import.meta.url, "P23-E24/compose.yaml")), { WEB_PORT: String(port) });
  const cfg = p.config();
  assert.ok(cfg.services?.web && /nginx/.test(cfg.services.web.image), "שירות web עם nginx");
  assert.deepEqual(cfg.services.app?.ports ?? [], [], "app לא חשוף למחשב — רק דרך nginx");
  assert.equal(cfg.services.app?.depends_on?.db?.condition, "service_healthy");
  const up = p.run(["up", "-d", "--build", "--wait"]);
  assert.ok(up.ok, `up נכשל:\n${tail(up.output)}\n${tail(p.run(["logs", "--no-color"]).output)}`);
  const base = `http://localhost:${port}`;
  const page = await (await waitForHttp(`${base}/`)).text();
  assert.match(page, /<h1>/, "הדף מוגש");
  let first;
  for (let i = 0; i < 40 && first === undefined; i++) {
    const res = await fetch(`${base}/api/visits`).catch(() => null);
    if (res?.ok) first = (await res.json()).visits;
    else await new Promise((r) => setTimeout(r, 500));
  }
  assert.equal(first, 1, "/api/visits דרך nginx");
  assert.equal((await (await fetch(`${base}/api/visits`)).json()).visits, 2);
  assert.equal((await fetch(`${base}/api/nothing`)).status, 404, "/api/nothing ← ה־404 של app");
});
