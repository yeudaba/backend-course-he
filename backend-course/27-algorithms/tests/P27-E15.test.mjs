import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { shortestPath } = await load(import.meta.url, "P27-E15.ts");

test("הדרך הקצרה ביותר במחסן", () => {
  assert.equal(shortestPath(["S.#.....", "..#.##..", "....#..E", "###...#."]), 11);
  assert.equal(shortestPath(["SE"]), 1);
  assert.equal(shortestPath(["S"]), -1, "אין E");
});
test("אין דרך ← −1", () => {
  assert.equal(shortestPath(["S#.", "##.", "..E"]), -1);
});
test("כשיש כמה דרכים — הקצרה, לא הראשונה שנמצאה", () => {
  const grid = [
    "S......",
    ".#####.",
    ".#...#.",
    ".#.#.#.",
    "...#..E",
  ];
  assert.equal(shortestPath(grid), 10);
});
test("מחסן של 400×400 — מהר", () => {
  const n = 400;
  const grid = Array.from({ length: n }, (_, y) => {
    let row = ".".repeat(n).split("");
    if (y % 4 === 1) row = row.map((c, x) => (x === n - 1 ? "." : "#"));
    if (y % 4 === 3) row = row.map((c, x) => (x === 0 ? "." : "#"));
    return row.join("");
  });
  grid[0] = "S" + grid[0].slice(1);
  grid[n - 1] = grid[n - 1].slice(0, n - 1) + "E";
  const d = fastEnough(() => shortestPath(grid), 1500, "shortestPath על מחסן 400×400 (נחש)");
  assert.equal(d, 79_800);
});
