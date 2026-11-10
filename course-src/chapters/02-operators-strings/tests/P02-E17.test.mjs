import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P02-E17.js";

test("Learn Node JS Fast", () => {
  sameOutput(run(import.meta.url, FILE), ["learn-node-js-fast", "https://blog.example.com/posts/learn-node-js-fast"]);
});

test("כותרת אחרת, עם רווחים בקצוות", () => {
  const r = run(import.meta.url, FILE, { changes: [[/(title\s*=\s*)(["'`]).*?\2/, '$1"   Why SQL Still Matters "', "את const title = ..."]] });
  sameOutput(r, ["why-sql-still-matters", "https://blog.example.com/posts/why-sql-still-matters"]);
});
