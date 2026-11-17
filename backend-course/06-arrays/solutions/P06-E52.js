function acronym(phrase) {
  let result = "";
  for (const word of phrase.split(" ")) {
    if (word === "") {
      continue;
    }
    result += word[0].toUpperCase();
  }
  return result;
}

console.log(acronym("Hyper Text Markup Language"), acronym("  as soon   as possible "));

module.exports = { acronym };
