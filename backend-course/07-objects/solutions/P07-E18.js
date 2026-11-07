// P07-E18: תדירות מילים עם Map
function words(text) {
  let clean = text.toLowerCase();
  for (const mark of [".", ",", "!", "?"]) {
    clean = clean.replaceAll(mark, " ");
  }
  return clean.split(" ").filter((w) => w !== "");
}

function wordFrequencies(text) {
  const counts = new Map();
  for (const w of words(text)) {
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return counts;
}

function topWords(text, n) {
  return [...wordFrequencies(text)]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n);
}

console.log(topWords("Node is fast. Node is fun! JS is everywhere, is it?", 3));

module.exports = { wordFrequencies, topWords };
