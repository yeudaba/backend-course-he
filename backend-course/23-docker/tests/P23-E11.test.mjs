import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { target } from "../../tools/load.mjs";
import { buildImage, composeProject, copyToTemp, docker, parseDockerfile, randomPort, readText, requireDocker, runContainer, tail, waitForHttp } from "../../tools/docker.mjs";
import { runScript } from "../../tools/shell.mjs";

const inspect = () => JSON.parse(docker(["inspect", "p23-e11-db"]).stdout || "[]")[0];

test("מסד לפיתוח בפקודה אחת", { timeout: 180000 }, async (t) => {
  requireDocker();
  t.after(() => {
    docker(["rm", "-f", "p23-e11-db"]);
    docker(["volume", "rm", "-f", "p23-e11-data"]);
  });
  for (const round of [1, 2]) {
    const r = runScript(import.meta.url, "P23-E11.sh", [], { timeout: 120000 });
    assert.equal(r.status, 0, `הרצה ${round} נכשלה (הסקריפט צריך לעבוד גם כשהקונטיינר כבר קיים):\n${r.stderr}`);
  }
  const c = inspect();
  assert.ok(c, "לא נמצא קונטיינר בשם p23-e11-db");
  assert.equal(c.Config.Image, "postgres:18-alpine");
  assert.ok(c.Config.Env.includes("POSTGRES_PASSWORD=course"), "POSTGRES_PASSWORD=course");
  assert.ok(c.Config.Env.includes("POSTGRES_DB=shop"), "POSTGRES_DB=shop");
  assert.equal(c.HostConfig.PortBindings?.["5432/tcp"]?.[0]?.HostPort, "55432", "port 55432 במחשב ← 5432 בקונטיינר");
  assert.equal(c.HostConfig.RestartPolicy.Name, "unless-stopped");
  const mount = c.Mounts.find((m) => m.Destination === "/var/lib/postgresql");
  assert.ok(mount && mount.Type === "volume" && mount.Name === "p23-e11-data", "volume בשם p23-e11-data ב־/var/lib/postgresql");
  let ready = false;
  for (let i = 0; i < 40 && !ready; i++) {
    ready = docker(["exec", "p23-e11-db", "pg_isready", "-U", "postgres", "-d", "shop"]).ok;
    if (!ready) await new Promise((r) => setTimeout(r, 500));
  }
  assert.ok(ready, "המסד לא עלה");
});
