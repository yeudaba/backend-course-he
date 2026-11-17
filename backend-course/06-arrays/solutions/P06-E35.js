function addTag(tags, tag) {
  if (tags.includes(tag)) {
    return false;
  }
  tags.push(tag);
  return true;
}

const tags = ["node"];
console.log(addTag(tags, "api"), addTag(tags, "node"), tags);

module.exports = { addTag };
