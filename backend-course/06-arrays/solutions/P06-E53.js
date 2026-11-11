function longestWord(sentence) {
  let best = "";
  for (const word of sentence.split(" ")) {
    if (word.length > best.length) {
      best = word;
    }
  }
  return best;
}

console.log(longestWord("I love backend development"), longestWord("cat dog"));

module.exports = { longestWord };
