function shortlog(text) {
  const counts = new Map();
  for (const line of text.split("\n")) {
    if (line.trim() === "") {
      continue;
    }
    const name = line.slice(0, line.indexOf("|"));
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, n]) => `${String(n).padStart(4)}  ${name}`);
}

console.log(shortlog("Dana|Add login\nOmer|Fix total\nDana|Add logout\nNoa|Update README\nDana|Add tests\n"));

module.exports = { shortlog };
