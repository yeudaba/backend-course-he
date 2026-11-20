function wordCount(text) {
  if (text.trim() === "") {
    return 0;
  }
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== " " && (i === 0 || text[i - 1] === " ")) {
      count++;
    }
  }
  return count;
}

function isLongerThan(text, limit = 10) {
  return wordCount(text) > limit;
}

console.log(wordCount("  קפה   הפינה פתוח "), isLongerThan("a b c", 2), isLongerThan("a b c"));

module.exports = { wordCount, isLongerThan };
