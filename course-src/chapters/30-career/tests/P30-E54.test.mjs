import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { skillsSection } = await load(import.meta.url, "P30-E54.ts");
const GROUPS = { Languages: ["TypeScript", "JavaScript", "SQL"], Backend: ["Node.js", "NestJS", "Express"], Data: ["PostgreSQL", "Redis", "Prisma"], Tooling: ["Docker", "Git", "GitHub Actions"] };
const ALIASES = { postgres: "PostgreSQL", psql: "PostgreSQL", postgresql: "PostgreSQL", node: "Node.js", nodejs: "Node.js", "node.js": "Node.js", ts: "TypeScript", typescript: "TypeScript", nest: "NestJS", nestjs: "NestJS", docker: "Docker", git: "Git" };

test("קנוני, בלי כפילויות, לפי סדר הופעה", () => {
  const raw = [" nestjs", "ts", "Postgres", "node", "Redis", "postgresql", "BullMQ", "docker", "", "  ", "TypeScript", "redis", "JavaScript", "Fastify"];
  assert.equal(skillsSection(raw, GROUPS, ALIASES), "Languages: TypeScript, JavaScript\nBackend: NestJS, Node.js\nData: PostgreSQL, Redis\nTooling: Docker\nOther: BullMQ, Fastify");
});
test("קבוצה ריקה לא מופיעה; בלי Other", () => {
  assert.equal(skillsSection(["git", "SQL"], GROUPS, ALIASES), "Languages: SQL\nTooling: Git");
  assert.equal(skillsSection([], GROUPS, ALIASES), "");
  assert.equal(skillsSection(["toString", "constructor"], GROUPS, ALIASES), "Other: toString, constructor", "רק מפתחות של aliases עצמו");
});
