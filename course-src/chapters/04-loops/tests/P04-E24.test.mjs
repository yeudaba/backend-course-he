import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P04-E24.js";
const withSize = (n) => run(import.meta.url, FILE, { changes: [[/(size\s*=\s*)4\b/, `$1${n}`, "את השורה const size = 4;"]] });

test("יהלום בגודל 4", () => sameOutput(run(import.meta.url, FILE), ["   *", "  ***", " *****", "*******", " *****", "  ***", "   *"]));
test("יהלום בגודל 2", () => sameOutput(withSize(2), [" *", "***", " *"]));
test("יהלום בגודל 1 — כוכבית אחת", () => sameOutput(withSize(1), ["*"]));
