import { test } from "node:test";
import { checkJestSpec } from "./_jest-mutation.mjs";

test("הבדיקות שלך (ב־Jest) עוברות על הקוד התקין ותופסות את הבאגים", () => checkJestSpec(import.meta.url, "P22-E74"));
