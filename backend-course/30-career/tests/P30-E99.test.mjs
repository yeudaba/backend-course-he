import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { stackContext } = await load(import.meta.url, "P30-E99.ts");

test("פרויקט NestJS", () => {
  const pkg = {
    type: "module",
    engines: { node: ">=24" },
    dependencies: { "@nestjs/core": "^12.0.3", "@prisma/client": "^7.1.0", pg: "^8.13.1", rxjs: "^7" },
    devDependencies: { vitest: "^3.2.0", typescript: "~5.9.2", prisma: "^7.1.0" },
  };
  assert.equal(stackContext(pkg), "Stack: Node.js >=24, TypeScript 5, NestJS 12, Prisma 7, PostgreSQL (pg 8), Vitest 3; ESM");
});
test("Express, CommonJS, בלי מספרים", () => {
  assert.equal(stackContext({ dependencies: { express: "5.1.0", ioredis: "latest" }, devDependencies: { jest: "^29" } }), "Stack: Express 5, Redis (ioredis), Jest 29; CommonJS");
  assert.equal(stackContext({}), "Stack: ; CommonJS");
  assert.equal(stackContext({ type: "commonjs", dependencies: { prisma: "6.0.0", "@prisma/client": "7.0.0" } }), "Stack: Prisma 6; CommonJS", "prisma לפני @prisma/client");
});
