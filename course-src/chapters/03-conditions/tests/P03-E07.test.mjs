import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E07.js";
const withN = (n) => run(import.meta.url, FILE, { changes: [[/(const\s+n\s*=\s*)17\b/, `$1${n}`, "את השורה const n = 17;"]] });

test("17 הוא אי־זוגי", () => sameOutput(run(import.meta.url, FILE), ["17 הוא אי־זוגי"]));
test("0 הוא זוגי", () => sameOutput(withN(0), ["0 הוא זוגי"]));
test("‎-4 הוא זוגי", () => sameOutput(withN(-4), ["-4 הוא זוגי"]));
test("‎-3 הוא אי־זוגי (השארית היא ‎-1, לא 1)", () => sameOutput(withN(-3), ["-3 הוא אי־זוגי"]));
