// P13-E55: כלי שסופר פריטים בקובץ JSON
export async function countItems(args, { log, error, readFile }) {
  if (args.length !== 1) {
    error("שימוש: count <file>");
    return 2;
  }
  const [file] = args;
  let text;
  try {
    text = await readFile(file, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      error(`הקובץ לא נמצא: ${file}`);
      return 1;
    }
    throw err;
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  if (!Array.isArray(data)) {
    error(`${file}: צריך מערך JSON`);
    return 1;
  }
  log(`${file}: ${data.length} פריטים`);
  return 0;
}

import fs from "node:fs/promises";
const io = { log: console.log, error: console.log, readFile: fs.readFile };
console.log(await countItems(["/no/such.json"], io));
console.log(await countItems([], io));
