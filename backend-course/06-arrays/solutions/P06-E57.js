function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

function capitalizeWords(text) {
  const words = [];
  for (const word of text.split(" ")) {
    if (word !== "") {
      words.push(capitalize(word));
    }
  }
  return words.join(" ");
}

console.log(capitalizeWords("  learn   NODE js "));

module.exports = { capitalize, capitalizeWords };
