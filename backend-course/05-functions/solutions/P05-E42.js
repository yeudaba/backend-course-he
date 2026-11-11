function repeatText(text, times, separator) {
  let result = "";
  for (let i = 0; i < times; i++) {
    if (i > 0) {
      result += separator;
    }
    result += text;
  }
  return result;
}

console.log(`[${repeatText("ab", 3, "-")}]`, `[${repeatText("x", 0, ",")}]`);

module.exports = { repeatText };
