function letterCounts(word) {
  const counts = {};
  for (const ch of word.toLowerCase()) {
    if (ch === " ") {
      continue;
    }
    counts[ch] = (counts[ch] ?? 0) + 1;
  }
  return counts;
}

console.log(letterCounts("Hello"), letterCounts("a b A"));

module.exports = { letterCounts };
