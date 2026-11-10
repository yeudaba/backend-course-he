import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P02-E16.js";
const withName = (n) => run(import.meta.url, FILE, { changes: [[/(fileName\s*=\s*)(["'`]).*?\2/, `$1"${n}"`, "את const fileName = ..."]] });

test("Invoice-March.PDF", () => {
  sameOutput(run(import.meta.url, FILE), ["שם: Invoice-March", "סיומת: pdf", "PDF? true"]);
});

test("photo.JPG — לא PDF", () => {
  sameOutput(withName("photo.JPG"), ["שם: photo", "סיומת: jpg", "PDF? false"]);
});

test("cv.pdf — סיומת באותיות קטנות מלכתחילה", () => {
  sameOutput(withName("cv.pdf"), ["שם: cv", "סיומת: pdf", "PDF? true"]);
});
