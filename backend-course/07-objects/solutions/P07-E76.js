function firstRepeated(words) {
  const seen = new Set();
  for (const w of words) {
    const word = w.toLowerCase();
    if (seen.has(word)) {
      return word;
    }
    seen.add(word);
  }
  return null;
}

console.log(firstRepeated(["a", "b", "c", "b", "a"]), firstRepeated(["Node", "api", "NODE"]));

module.exports = { firstRepeated };
