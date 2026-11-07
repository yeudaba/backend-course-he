// P10-E14
const fs = require("node:fs/promises");
const path = require("node:path");

function countLines(text) {
  if (text === "") {
    return 0;
  }
  const trimmed = text.endsWith("\n") ? text.slice(0, -1) : text;
  return trimmed.split("\n").length;
}

async function lineCounts(dir) {
  const names = (await fs.readdir(dir)).filter((n) => n.endsWith(".txt"));
  const pairs = await Promise.all(
    names.map(async (name) => [name, countLines(await fs.readFile(path.join(dir, name), "utf8"))])
  );
  return Object.fromEntries(pairs);
}

module.exports = { lineCounts, countLines };
