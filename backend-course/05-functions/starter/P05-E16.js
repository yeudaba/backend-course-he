// P05-E16: ספירת תווים
// countMatching(text, predicate): כמה תווים מקיימים את predicate
function countMatching(text, predicate) {
  // כתוב כאן
}

// countChar(text, ch): כמה פעמים ch מופיע
function countChar(text, ch) {
  // כתוב כאן
}

// countVowels(text): a e i o u בלי תלות באותיות — בעזרת countMatching, בלי לולאה משלה
function countVowels(text) {
  // כתוב כאן
}

console.log(countChar("banana", "a"), countVowels("Hello World"));

module.exports = { countChar, countMatching, countVowels };
