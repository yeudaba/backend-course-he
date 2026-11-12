import { test } from "node:test";
import assert from "node:assert/strict";
import { compose, envOf, testOf } from "./_compose.mjs";

test("db ו־cache", () => {
  const c = compose(import.meta.url, "P23-E70/compose.yaml");
  const { db, cache } = c.services;
  assert.ok(db, "שירות db");
  assert.match(db.image, /^postgres:18-alpine$/);
  assert.deepEqual(envOf(db), { POSTGRES_USER: "shop", POSTGRES_PASSWORD: "shop", POSTGRES_DB: "shop" });
  assert.ok((db.volumes ?? []).includes("db-data:/var/lib/postgresql"), "volume db-data על /var/lib/postgresql (נתיב של גרסה 18)");
  assert.match(testOf(db.healthcheck), /pg_isready -U shop -d shop/);
  assert.equal(db.ports, undefined, "למסד אין ports");
  assert.ok(cache, "שירות cache");
  assert.match(cache.image, /^redis:8-alpine$/);
  assert.match(testOf(cache.healthcheck), /redis-cli ping/);
  assert.equal(cache.ports, undefined, "ל־cache אין ports");
  assert.ok(c.volumes && "db-data" in c.volumes, "volumes: db-data ברמה העליונה");
});
test("app", () => {
  const { app } = compose(import.meta.url, "P23-E70/compose.yaml").services;
  assert.ok(app, "שירות app");
  assert.ok(app.build === "." || app.build?.context === ".", "build: .");
  assert.deepEqual(envOf(app), { DATABASE_URL: "postgresql://shop:shop@db:5432/shop", REDIS_URL: "redis://cache:6379" });
  assert.deepEqual(app.ports, ["${APP_PORT:-3000}:3000"]);
  assert.equal(app.depends_on?.db?.condition, "service_healthy");
  assert.equal(app.depends_on?.cache?.condition, "service_healthy");
});
