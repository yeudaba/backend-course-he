import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P02-E25.js";
const withSeconds = (n) => run(import.meta.url, FILE, { changes: [[/(totalSeconds\s*=\s*)3725\b/, `$1${n}`, "את const totalSeconds = 3725"]] });

test("3725 שניות = 01:02:05", () => {
  sameOutput(run(import.meta.url, FILE), ["3725 שניות = 01:02:05"]);
});

for (const [n, clock] of [
  [0, "00:00:00"],
  [59, "00:00:59"],
  [3600, "01:00:00"],
  [86399, "23:59:59"],
]) {
  test(`${n} שניות = ${clock}`, () => sameOutput(withSeconds(n), [`${n} שניות = ${clock}`]));
}
