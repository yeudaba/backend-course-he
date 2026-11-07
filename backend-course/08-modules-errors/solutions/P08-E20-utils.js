// P08-E20: כלי עזר — מתוקן
function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1);
}

function shout(text) {
  return `${text.toUpperCase()}!`;
}

module.exports = { capitalize, shout };
