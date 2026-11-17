import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import YAML from "yaml";
import { target } from "../../tools/load.mjs";

const doc = YAML.parse(fs.readFileSync(target(import.meta.url, "P26-E103.yaml"), "utf8")) ?? {};
const s = doc.services ?? {};
const flat = (x) => (Array.isArray(x) ? x.join(" ") : String(x ?? ""));
const env = (svc) => (Array.isArray(svc?.environment) ? Object.fromEntries(svc.environment.map((l) => l.split(/=(.*)/s).slice(0, 2))) : svc?.environment ?? {});

test("שלושה שירותים", () => {
  for (const name of ["db", "redis", "api"]) assert.ok(s[name], `חסר שירות ${name}`);
  assert.equal(s.db.image, "postgres:18-alpine");
  assert.equal(s.redis.image, "redis:8-alpine");
  assert.equal(s.api.build, ".");
});
test("healthchecks", () => {
  assert.match(flat(s.redis?.healthcheck?.test), /redis-cli.*ping/, "redis: healthcheck עם redis-cli ping");
  assert.match(flat(s.db?.healthcheck?.test), /pg_isready/, "db: healthcheck עם pg_isready");
  assert.equal(s.redis?.ports, undefined, "ל־redis אין ports — רק ה־api מגיע אליו, ברשת הפנימית");
  const e = env(s.db);
  for (const k of ["POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB"]) assert.equal(String(e[k]), "shop", k);
});
test("api: סביבה, פורט ו־depends_on עם service_healthy", () => {
  const e = env(s.api);
  assert.equal(e.REDIS_URL, "redis://redis:6379");
  assert.equal(e.REDIS_PREFIX, "shop");
  assert.match(String(e.DATABASE_URL ?? ""), /^postgres(ql)?:\/\/shop:shop@db:5432\/shop$/);
  assert.ok(flat(s.api?.ports).includes("3000:3000"), "פורט 3000");
  const d = s.api?.depends_on;
  assert.ok(d && !Array.isArray(d), "depends_on כמפה (עם condition), לא כרשימה");
  assert.equal(d.db?.condition, "service_healthy");
  assert.equal(d.redis?.condition, "service_healthy");
});
