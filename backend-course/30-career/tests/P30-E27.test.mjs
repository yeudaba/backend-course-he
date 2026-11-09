import { test } from "node:test";
import { checkSpec } from "../../tools/mutation.mjs";

test("הבדיקות שלך עוברות על הקוד של ה־AI ותופסות את הטעויות הנפוצות", () => checkSpec(import.meta.url, "P30-E27"));
