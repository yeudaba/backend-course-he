function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1);
}

function truncate(text, max) {
  if (text.length <= max) {
    return text;
  }
  return text.slice(0, max - 1) + "…";
}

module.exports = { capitalize, truncate };
