import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E16.js";
const params = ({ page = "undefined", limit = "0", sort = '""', minPrice = "0" } = {}) =>
  run(import.meta.url, FILE, {
    changes: [
      [/(pageParam\s*=\s*)[^;\n]+/, `$1${page}`, "את const pageParam = ..."],
      [/(limitParam\s*=\s*)[^;\n]+/, `$1${limit}`, "את const limitParam = ..."],
      [/(sortParam\s*=\s*)[^;\n]+/, `$1${sort}`, "את const sortParam = ..."],
      [/(minPriceParam\s*=\s*)[^;\n]+/, `$1${minPrice}`, "את const minPriceParam = ..."],
    ],
  });

test("הערכים מהתרגיל", () => sameOutput(run(import.meta.url, FILE), ["page=1 limit=20 sort=newest minPrice=0"]));
test("כל הפרמטרים נשלחו", () => sameOutput(params({ page: "3", limit: "50", sort: '"price"', minPrice: "10" }), ["page=3 limit=50 sort=price minPrice=10"]));
test("limit גדול מ־100 ← 20", () => sameOutput(params({ limit: "150" }), ["page=1 limit=20 sort=newest minPrice=0"]));
test("limit = 100 בדיוק — חוקי", () => sameOutput(params({ limit: "100" }), ["page=1 limit=100 sort=newest minPrice=0"]));
test("שום דבר לא נשלח (הכול undefined)", () => sameOutput(params({ limit: "undefined", sort: "undefined", minPrice: "undefined" }), ["page=1 limit=20 sort=newest minPrice=0"]));
