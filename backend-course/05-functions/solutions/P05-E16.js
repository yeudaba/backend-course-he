// P05-E16: ספירת תווים
function countMatching(text, predicate) {
  let count = 0;
  for (const ch of text) {
    if (predicate(ch)) {
      count++;
    }
  }
  return count;
}

function countChar(text, ch) {
  return countMatching(text, (c) => c === ch);
}

function countVowels(text) {
  return countMatching(text.toLowerCase(), (ch) => "aeiou".includes(ch));
}

console.log(countChar("banana", "a"), countVowels("Backend Developers Love Coffee"));

module.exports = { countChar, countMatching, countVowels };
