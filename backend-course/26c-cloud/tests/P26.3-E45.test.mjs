import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { awsPlanFromCompose } = await load(import.meta.url, "P26.3-E45.ts");

const shop = `
services:
  web:
    image: nginx:1.29-alpine
  redis:
    image: redis:8-alpine
  db:
    image: postgres:18-alpine
  migrate:
    build: .
    command: ["npx", "prisma", "migrate", "deploy"]
    depends_on:
      db:
        condition: service_healthy
  api:
    build: .
    depends_on:
      migrate:
        condition: service_completed_successfully
      redis:
        condition: service_healthy
  exporter:
    image: bitnami/redis-exporter:1
    depends_on: [redis]
`;

test("חנות הקפה", () => {
  assert.deepEqual(awsPlanFromCompose(shop), [
    { service: "api", target: "EKS Deployment" },
    { service: "db", target: "RDS" },
    { service: "exporter", target: "EKS Deployment" },
    { service: "migrate", target: "EKS Job" },
    { service: "redis", target: "ElastiCache" },
    { service: "web", target: "EKS Deployment" },
  ]);
});
test("mysql, valkey, ובלי services", () => {
  assert.deepEqual(awsPlanFromCompose("services:\n  m:\n    image: mysql:8.4\n  v:\n    image: valkey/valkey:8\n"), [
    { service: "m", target: "RDS" },
    { service: "v", target: "ElastiCache" },
  ]);
  assert.deepEqual(awsPlanFromCompose("version: '3'\n"), []);
});
