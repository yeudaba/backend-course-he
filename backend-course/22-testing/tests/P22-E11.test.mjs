import { test } from "node:test";
import { checkSpec } from "../../tools/mutation.mjs";

test("הבדיקות שלך עוברות על הקוד התקין ותופסות את הבאגים", () => checkSpec(import.meta.url, "P22-E11"));
