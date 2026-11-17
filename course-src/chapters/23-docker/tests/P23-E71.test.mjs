import { test } from "node:test";
import assert from "node:assert/strict";
import YAML from "yaml";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P23-E71.ts", ["lintCompose"])).lintCompose;
const GOOD = `
services:
  db:
    image: postgres:18-alpine
    volumes: [db-data:/var/lib/postgresql]
  app:
    build: .
    environment:
      DATABASE_URL: postgresql://app:app@db:5432/app
    ports: ["3000:3000"]
    depends_on:
      db: { condition: service_healthy }
volumes:
  db-data:
`;
const BAD = `
services:
  app:
    build: .
    environment:
      - DATABASE_URL=postgresql://app:app@localhost:5432/app
      - REDIS_URL=redis://127.0.0.1:6379
      - LOG_LEVEL=info
    depends_on: [db, cache]
  db:
    image: postgres:18-alpine
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
  cache:
    image: redis
    ports: ["6379:6379"]
  web:
    image: nginx:latest
    environment:
      API: http://app:3000
  old:
    image: postgres:17
    volumes: ["x:/var/lib/postgresql/data"]
`;

test("קובץ טוב ← אין הערות", async () => {
  const lint = await get();
  assert.deepEqual(lint(YAML.parse(GOOD)), []);
});
test("כל הבעיות, לפי סדר השירותים והכללים", async () => {
  const lint = await get();
  assert.deepEqual(lint(YAML.parse(BAD)), [
    "app: depends_on בלי condition",
    "app: localhost ב־DATABASE_URL",
    "app: localhost ב־REDIS_URL",
    "db: מסד עם ports",
    "db: volume של PostgreSQL 18 בנתיב הישן",
    "cache: image בלי tag",
    "cache: מסד עם ports",
    "web: image בלי tag",
  ]);
  assert.deepEqual(lint({ services: {} }), []);
});
