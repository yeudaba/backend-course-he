// P10-E13
const fs = require("node:fs/promises");

async function readFirstExisting(files) {
  for (const file of files) {
    try {
      const text = await fs.readFile(file, "utf8");
      return { file, text };
    } catch {
      // הקובץ לא קיים או לא קריא — ננסה את הבא
    }
  }
  throw new Error("לא נמצא אף קובץ");
}

readFirstExisting(["/nope1", "/nope2"]).catch((e) => console.log(e.message));

module.exports = { readFirstExisting };
