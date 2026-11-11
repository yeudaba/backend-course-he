function longest(words) {
  return words.reduce((best, w) => (w.length > best.length ? w : best), "");
}

console.log(longest(["api", "backend", "node"]));

module.exports = { longest };
