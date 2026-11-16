import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { stability } = await load(import.meta.url, "P29-E93.ts");
const run = (spec) => spec.split(" ").map((s) => ({ name: s.slice(1), passed: s[0] === "+" }));

test("יציב, שבור, מהבהב — הגרוע קודם", () => {
  const runs = [run("+a -b +c +d -e"), run("+a -b -c +d +e"), run("+a -b +c -d -e"), run("+a -b +c +d -e")];
  assert.deepEqual(stability(runs), { stable: ["a"], broken: ["b"], flaky: [{ name: "e", passRate: 0.25 }, { name: "c", passRate: 0.75 }, { name: "d", passRate: 0.75 }] });
});
test("מקרה שחסר בהרצה — לא נספר בה; עיגול", () => {
  const runs = [run("+x -y"), run("+x +y +z"), run("-y +z"), run("-z")];
  assert.deepEqual(stability(runs), { stable: ["x"], broken: [], flaky: [{ name: "y", passRate: 0.33 }, { name: "z", passRate: 0.67 }] });
});
test("ריק, והרצה אחת", () => {
  assert.deepEqual(stability([]), { stable: [], broken: [], flaky: [] });
  assert.deepEqual(stability([run("-q +p")]), { stable: ["p"], broken: ["q"], flaky: [] });
});
