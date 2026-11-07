// P06-E14: ניקוי תגיות
function cleanTags(input, max = 5) {
  return input
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== "")
    .filter((tag, i, all) => all.indexOf(tag) === i)
    .slice(0, max);
}

console.log(cleanTags(" Node, , backend ,API, node ,  "));

module.exports = { cleanTags };
