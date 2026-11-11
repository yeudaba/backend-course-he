function parseSettings(text) {
  const result = {};
  for (const part of text.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === "") {
      continue;
    }
    result[key] = value;
  }
  return result;
}

console.log(parseSettings("name=Dana; age=31 ;city=Haifa"));
console.log(parseSettings("a=1;;broken; =x; a=2; q=a=b"));

module.exports = { parseSettings };
