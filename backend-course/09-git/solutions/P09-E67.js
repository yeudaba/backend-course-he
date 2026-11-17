function parseBranches(text) {
  let current = null;
  const others = [];
  for (const line of text.split("\n")) {
    if (line.trim() === "") {
      continue;
    }
    const name = line.slice(2).trim();
    if (line.startsWith("* ")) {
      current = name;
    } else {
      others.push(name);
    }
  }
  others.sort((a, b) => a.localeCompare(b));
  return { current, others };
}

console.log(parseBranches("  feature/summary\n* main\n  fix/typo\n"));

module.exports = { parseBranches };
