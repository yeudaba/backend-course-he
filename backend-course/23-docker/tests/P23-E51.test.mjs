import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P23-E51.ts", ["summarize"])).summarize;
const INSPECT = [{
  Name: "/tasks-api-db-1",
  Config: { Image: "postgres:18-alpine", Env: ["POSTGRES_PASSWORD=tasks", "POSTGRES_USER=tasks", "PGDATA=/var/lib/postgresql/18/docker", "DATABASE_URL=postgresql://u:p@db/x?sslmode=require", "API_KEY=k1", "jwt_secret=s", "LANG=C.UTF-8"] },
  State: { Running: true, Health: { Status: "healthy" } },
  HostConfig: { PortBindings: { "5432/tcp": [{ HostIp: "127.0.0.1", HostPort: "55432" }], "80/tcp": [{ HostIp: "", HostPort: "8080" }, { HostIp: "::", HostPort: "8080" }] } },
  Mounts: [{ Type: "volume", Name: "tasks-api_db-data", Source: "/var/lib/docker/volumes/x", Destination: "/var/lib/postgresql" }, { Type: "bind", Source: "/Users/dana/web", Destination: "/usr/share/nginx/html" }],
}];

test("סיכום", async () => {
  const summarize = await get();
  assert.deepEqual(summarize(INSPECT), {
    name: "tasks-api-db-1",
    image: "postgres:18-alpine",
    running: true,
    health: "healthy",
    ports: ["0.0.0.0:8080->80/tcp", "127.0.0.1:55432->5432/tcp", ":::8080->80/tcp"],
    mounts: ["volume tasks-api_db-data → /var/lib/postgresql", "bind /Users/dana/web → /usr/share/nginx/html"],
    env: { POSTGRES_PASSWORD: "***", POSTGRES_USER: "tasks", PGDATA: "/var/lib/postgresql/18/docker", DATABASE_URL: "postgresql://u:p@db/x?sslmode=require", API_KEY: "***", jwt_secret: "***", LANG: "C.UTF-8" },
  });
});
test("בלי health, בלי ports ו־mounts", async () => {
  const summarize = await get();
  const r = summarize([{ Name: "/x", Config: { Image: "node:24-alpine", Env: [] }, State: { Running: false }, HostConfig: { PortBindings: {} }, Mounts: [] }]);
  assert.deepEqual(r, { name: "x", image: "node:24-alpine", running: false, health: null, ports: [], mounts: [], env: {} });
  assert.throws(() => summarize([]), { message: "אין קונטיינר" });
});
