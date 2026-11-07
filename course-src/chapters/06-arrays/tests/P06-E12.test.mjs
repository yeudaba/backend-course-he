import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { sortAsc, sortDesc, sortByLength, sortAlpha } = await load(import.meta.url, "P06-E12.js");

test("sortAsc ממיין מספרים נכון", () => assert.deepEqual(sortAsc([10, 1, 5, 100]), [1, 5, 10, 100]));
test("sortDesc", () => assert.deepEqual(sortDesc([10, 1, 5, 100]), [100, 10, 5, 1]));
test("sortByLength", () => assert.deepEqual(sortByLength(["ccc", "a", "bb"]), ["a", "bb", "ccc"]));
test("sortAlpha (גם עברית)", () => { assert.deepEqual(sortAlpha(["דנה", "אבי", "גיל"]), ["אבי", "גיל", "דנה"]); });
test("המערך המקורי לא משתנה", () => { const a = [3, 1, 2]; sortAsc(a); sortDesc(a); assert.deepEqual(a, [3, 1, 2]); const w = ["bb", "a"]; sortByLength(w); sortAlpha(w); assert.deepEqual(w, ["bb", "a"]); });
