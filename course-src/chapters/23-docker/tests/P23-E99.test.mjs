import { test } from "node:test";
import assert from "node:assert/strict";
import YAML from "yaml";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P23-E99.ts", ["hardcodedSecrets"])).hardcodedSecrets;

test("הפרויקט (שיעור 5) — תקין", async () => {
  const f = await get();
  const doc = YAML.parse(`
services:
  db:
    image: postgres:18-alpine
    environment: { POSTGRES_USER: tasks, POSTGRES_PASSWORD: tasks, POSTGRES_DB: tasks }
  api:
    environment:
      DATABASE_URL: postgresql://tasks:tasks@db:5432/tasks
      JWT_SECRET: \${JWT_SECRET:?הגדר JWT_SECRET}
    ports: ["\${API_PORT:-3000}:3000"]
`);
  assert.deepEqual(f(doc), []);
});
test("סודות בקובץ", async () => {
  const f = await get();
  const doc = YAML.parse(`
services:
  api:
    environment:
      - JWT_SECRET=dev-secret
      - STRIPE_API_KEY=sk_live_abc
      - DATABASE_URL=postgresql://app:app@db:5432/app
      - LOG_LEVEL=info
      - SESSION_TOKEN=$TOKEN
  db:
    image: postgres:18-alpine
    environment: { POSTGRES_PASSWORD: postgres }
    ports: ["5432:5432"]
  worker:
    environment:
      password: hunter2
      DATABASE_URL: postgresql://app:\${DB_PASS}@db:5432/app
      CACHE_URL: redis://cache:6379
`);
  assert.deepEqual(f(doc), ["api.JWT_SECRET", "api.STRIPE_API_KEY", "api.DATABASE_URL", "db.POSTGRES_PASSWORD", "worker.password"]);
  assert.deepEqual(f({ services: {} }), []);
});
