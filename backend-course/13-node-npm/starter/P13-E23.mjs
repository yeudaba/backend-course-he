// P13-E23: תמיד מחזיר 0, קורא הכול לזיכרון, וסופר שורה ריקה. כתוב מחדש עם readline.
import fs from "node:fs";

export async function countMatchingLines(file, word) {
  let count = 0;
  fs.readFile(file, "utf8", (err, text) => {
    for (const line of text.split("\n")) {
      if (line.includes(word) || line === "") count++;
    }
  });
  return count;
}
