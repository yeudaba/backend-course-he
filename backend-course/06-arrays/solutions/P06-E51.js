function numberedList(items) {
  const lines = [];
  for (let i = 0; i < items.length; i++) {
    lines.push(`${i + 1}. ${items[i]}`);
  }
  return lines.join("\n");
}

console.log(numberedList(["חלב", "לחם", "ביצים"]));

module.exports = { numberedList };
