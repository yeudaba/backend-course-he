import { test } from "node:test";
import assert from "node:assert/strict";
import { compose, envOf, testOf } from "./_compose.mjs";

test("test-db בזיכרון", () => {
  const { "test-db": db } = compose(import.meta.url, "P23-E78/compose.test.yaml").services;
  assert.ok(db, "שירות test-db");
  assert.match(db.image, /^postgres:18-alpine$/);
  assert.deepEqual(envOf(db), { POSTGRES_USER: "test", POSTGRES_PASSWORD: "test", POSTGRES_DB: "test" });
  const tmpfs = [].concat(db.tmpfs ?? []);
  assert.ok(tmpfs.includes("/var/lib/postgresql"), "tmpfs: /var/lib/postgresql");
  assert.equal(db.volumes, undefined, "בלי volumes — הנתונים לא צריכים לשרוד");
  assert.equal(db.ports, undefined, "בלי ports");
  assert.match(testOf(db.healthcheck), /pg_isready -U test -d test/);
});
test("tests", () => {
  const c = compose(import.meta.url, "P23-E78/compose.test.yaml");
  const t = c.services.tests;
  assert.ok(t, "שירות tests");
  assert.deepEqual(t.build, { context: ".", target: "build" });
  assert.deepEqual(t.command, ["npm", "run", "test:int"]);
  assert.deepEqual(envOf(t), { DATABASE_URL_TEST: "postgresql://test:test@test-db:5432/test" });
  assert.equal(t.depends_on?.["test-db"]?.condition, "service_healthy");
  assert.equal(t.ports, undefined);
  assert.equal(c.volumes, undefined, "בלי volumes בכלל");
});
