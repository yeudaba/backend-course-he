// P08-E20: כלי עזר
function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1);
}

function shout(text) {
  return `${text.toUpperCase()}!`;
}

module.exports = { capitalize: capitalize(), yell: shout };
