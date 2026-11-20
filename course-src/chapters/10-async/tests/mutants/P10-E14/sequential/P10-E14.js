const fs = require("node:fs/promises");
const path = require("node:path");
function countLines(text) { if (text === "") return 0; const t = text.endsWith("\n") ? text.slice(0, -1) : text; return t.split("\n").length; }
async function lineCounts(dir) {
  const out = {};
  for (const name of await fs.readdir(dir)) if (name.endsWith(".txt")) out[name] = countLines(await fs.readFile(path.join(dir, name), "utf8"));
  return out;
}
module.exports = { lineCounts, countLines };
