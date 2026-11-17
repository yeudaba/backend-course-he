function parseStatus(text) {
  const result = { staged: [], modified: [], untracked: [] };
  for (const line of text.split("\n")) {
    if (line === "") {
      continue;
    }
    const file = line.slice(3);
    if (line.startsWith("??")) {
      result.untracked.push(file);
      continue;
    }
    if (line[0] !== " ") {
      result.staged.push(file);
    }
    if (line[1] !== " ") {
      result.modified.push(file);
    }
  }
  return result;
}

console.log(parseStatus("A  README.md\n M app.js\nMM cart.js\n?? notes.txt\n"));

module.exports = { parseStatus };
