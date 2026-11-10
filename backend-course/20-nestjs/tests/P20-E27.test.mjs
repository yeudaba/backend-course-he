import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const FILE = "P20-E27.ts";
function load() {
  const m = loadNest(import.meta.url, FILE);
  for (const name of ["slugify", "SlugPipe", "SlugsModule"]) {
    assert.ok(m[name], `הקובץ לא מייצא את ${name}. כתוב export לפני ההגדרה`);
  }
  return m;
}

test("slugify", () => {
  const { slugify } = load();
  const cases = [
    ["Hello World", "hello-world"],
    ["  NestJS: Pipes & Guards!  ", "nestjs-pipes-guards"],
    ["Top 10 SQL tips", "top-10-sql-tips"],
    ["a---b___c", "a-b-c"],
    ["שלום Backend", "backend"],
    ["!!!", ""],
  ];
  for (const [input, expected] of cases) assert.equal(slugify(input), expected, `slugify(${JSON.stringify(input)})`);
});
test("SlugPipe לבד", () => {
  const { SlugPipe } = load();
  const pipe = new SlugPipe();
  assert.equal(pipe.transform("hello-world", { type: "param" }), "hello-world");
  for (const bad of ["Hello", "hello--world", "-hello", "hello-", "hello world", "שלום", "", "a".repeat(61)]) {
    assert.throws(() => pipe.transform(bad, { type: "param" }), (e) => e.getStatus?.() === 400 && e.message === `slug לא תקין: ${bad}`, `"${bad}" ← BadRequestException("slug לא תקין: ${bad}")`);
  }
});
test("דרך HTTP", async (t) => {
  const { SlugsModule } = load();
  const { call } = await nestApp(t, SlugsModule);
  assert.deepEqual((await call("GET", "/slugs/top-10-sql-tips")).body, { slug: "top-10-sql-tips" });
  const bad = await call("GET", "/slugs/Top-10");
  assert.equal(bad.status, 400, "slug לא תקין ב־URL ← 400 (SlugPipe על הפרמטר)");
  assert.equal(bad.body?.message, "slug לא תקין: Top-10");
  assert.deepEqual((await call("GET", "/slugs/preview?title=" + encodeURIComponent("Hello, Nest World!"))).body, { slug: "hello-nest-world" }, "GET /slugs/preview?title=... — שים את ה־route הזה לפני :slug");
});
