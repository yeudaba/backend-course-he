// P06-E16: טיפול במילים עם מערכים
function words(text) {
  return text.trim().split(" ").filter((w) => w !== "");
}

function toSlug(title) {
  return words(title.toLowerCase()).join("-");
}

function titleCase(text) {
  return words(text)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function wordCount(text) {
  return words(text).length;
}

console.log(toSlug("  Learn   Node JS  "), "|", titleCase("  learn   NODE js "), "|", wordCount("  a  b c "));

module.exports = { toSlug, titleCase, wordCount };
