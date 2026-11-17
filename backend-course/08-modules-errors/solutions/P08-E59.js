function countWords(text) {
  const words = text.split(" ");
  let count = 0;
  for (let i = 0; i < words.length; i++) {
    if (words[i] !== "") {
      count++;
    }
  }
  return count;
}

console.log(countWords("learn node js"), countWords(""));

module.exports = { countWords };
