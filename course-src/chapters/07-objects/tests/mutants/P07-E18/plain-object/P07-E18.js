// מחזיר אובייקט רגיל עם get/has "מזויפים" — לא Map
function words(text) {
  let clean = text.toLowerCase();
  for (const mark of [".", ",", "!", "?"]) clean = clean.replaceAll(mark, " ");
  return clean.split(" ").filter((w) => w !== "");
}
function wordFrequencies(text) {
  const counts = {};
  for (const w of words(text)) counts[w] = (counts[w] ?? 0) + 1;
  return { get: (k) => counts[k], has: (k) => k in counts, entries: () => Object.entries(counts) };
}
function topWords(text, n) {
  return wordFrequencies(text).entries().sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n);
}
module.exports = { wordFrequencies, topWords };
