import { test } from "node:test";
import { run, sameOutput } from "./_out.mjs";

const FILE = "P03-E15.js";
const canEdit = (role, isAuthor, isLocked, isPublished) =>
  run(import.meta.url, FILE, {
    changes: [
      [/(role\s*=\s*)(["'`]).*?\2/, `$1"${role}"`, "את const role = ..."],
      [/(isAuthor\s*=\s*)(true|false)/, `$1${isAuthor}`, "את const isAuthor = ..."],
      [/(isLocked\s*=\s*)(true|false)/, `$1${isLocked}`, "את const isLocked = ..."],
      [/(isPublished\s*=\s*)(true|false)/, `$1${isPublished}`, "את const isPublished = ..."],
    ],
  });

for (const [args, expected, why] of [
  [["admin", false, true, true], true, "מנהל — גם כשהמסמך נעול"],
  [["editor", false, false, true], true, "עורך, מסמך לא נעול"],
  [["editor", false, true, false], false, "עורך, מסמך נעול"],
  [["viewer", true, false, false], true, "כותב, לא נעול ולא פורסם"],
  [["viewer", true, false, true], false, "כותב של מסמך שפורסם"],
  [["viewer", true, true, false], false, "כותב של מסמך נעול"],
  [["viewer", false, false, false], false, "סתם צופה"],
]) {
  test(`${why} ← ${expected}`, () => sameOutput(canEdit(...args), [`רשאי לערוך? ${expected}`]));
}
