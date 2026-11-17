import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P23-E63.ts", ["lintDockerfile"])).lintDockerfile;
const GOOD = `# טוב
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
HEALTHCHECK --interval=5s \\
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "dist/main.js"]
`;

test("Dockerfile טוב ← אין הערות", async () => {
  const lint = await get();
  assert.deepEqual(lint(GOOD), []);
});
test("כל הבעיות, לפי הסדר", async () => {
  const lint = await get();
  const BAD = `FROM node
WORKDIR /app
ARG NPM_TOKEN
COPY . .
RUN npm install
env jwt_secret=abc
ENV API_KEY abc
ENV LOG_LEVEL=info
CMD npm start
`;
  assert.deepEqual(lint(BAD), [
    "FROM בלי tag",
    "npm install במקום npm ci",
    "COPY . . לפני התקנת התלויות",
    "סוד ב־ENV או ARG: NPM_TOKEN",
    "סוד ב־ENV או ARG: jwt_secret",
    "סוד ב־ENV או ARG: API_KEY",
    "אין USER — רץ כ־root",
    "CMD בצורת מחרוזת",
  ]);
});
test("מקרים עדינים", async () => {
  const lint = await get();
  assert.deepEqual(lint("FROM node:latest\nUSER node\nCMD [\"node\", \"a.js\"]\n"), ["FROM בלי tag"], ":latest נחשב בלי tag");
  assert.deepEqual(lint(`FROM node:24-alpine@sha256:abc\nUSER node\nCMD ["node","a.js"]\n`), [], "digest זה בסדר");
  assert.deepEqual(lint("FROM node:24-alpine AS build\nUSER node\nRUN npm ci\nFROM node:24-alpine\nCMD [\"node\", \"a.js\"]\n"), ["אין USER — רץ כ־root"], "USER בשלב build לא נחשב");
  assert.deepEqual(lint("FROM node:24-alpine\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nUSER node\nCMD [\"node\", \"a.js\"]\n"), [], "COPY . . אחרי npm ci — בסדר");
  assert.deepEqual(lint("FROM node:24-alpine AS a\nRUN npm ci\nFROM node:24-alpine\nCOPY . .\nRUN npm ci\nUSER node\nCMD [\"x\"]\n"), ["COPY . . לפני התקנת התלויות"], "בודקים בכל שלב בנפרד");
});
