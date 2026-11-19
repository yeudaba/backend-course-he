function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text, word) {
  if (word === "") {
    return text;
  }
  return text.replace(new RegExp(escapeRegex(word), "gi"), "**$&**");
}

console.log(highlight("C++ או c++? בחר c++", "c++"));
console.log(highlight("105 או 1.5", "1.5"));

module.exports = { highlight };
