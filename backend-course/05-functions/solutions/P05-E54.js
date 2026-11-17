function countVowels(text) {
  let count = 0;
  for (const ch of text.toLowerCase()) {
    if ("aeiou".includes(ch)) {
      count++;
    }
  }
  return count;
}

function hasVowel(text) {
  return countVowels(text) > 0;
}

console.log(countVowels("Backend Developers"), hasVowel("rhythm"));

module.exports = { countVowels, hasVowel };
