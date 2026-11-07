// P10-E14
const fs = require("node:fs/promises");
const path = require("node:path");

// "a\nb\n" → 2 | "a" → 1 | "" → 0
function countLines(text) {
  // כתוב כאן
}

// { "a.txt": 3, "b.txt": 0 } — רק קבצי .txt, במקביל
async function lineCounts(dir) {
  // כתוב כאן
}

module.exports = { lineCounts, countLines };
